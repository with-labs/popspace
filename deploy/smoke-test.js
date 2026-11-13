/*
  End-to-end smoke test for a running PopSpace stack (docker compose or yarn dev).

    yarn smoke-test

  It signs in as the admin from the root .env, creates a room, uploads an
  image, creates a notepad through hermes, edits it through unicorn, checks
  that a stranger can't read the notepad or the file, then deletes everything
  it created. Exits with 1 if any check fails.

  By default every service is reached on its own port (8888-8891). Behind the
  single-origin reverse proxy, set SMOKE_BASE_URL=https://popspace.example.com
  and the API, hermes and unicorn are reached under /api, /hermes, /unicorn.
*/
const path = require('path')
const { createRequire } = require('module')

// ws and ShareDB come from unicorn's dependencies
const unicornRequire = createRequire(path.join(__dirname, '..', 'unicorn', 'package.json'))
const WebSocket = unicornRequire('ws')
const ShareDBClient = unicornRequire('sharedb/lib/client')
ShareDBClient.types.register(unicornRequire('rich-text').type)

const base = process.env.SMOKE_BASE_URL && process.env.SMOKE_BASE_URL.replace(/\/$/, '')
const toWs = (url) => url.replace(/^http/, 'ws')
const urls = {
  ui: base || process.env.SMOKE_UI_URL || 'http://localhost:8888',
  api: base ? `${base}/api` : process.env.SMOKE_API_URL || 'http://localhost:8889',
  hermes: base ? `${toWs(base)}/hermes` : process.env.SMOKE_HERMES_URL || 'ws://localhost:8890',
  unicorn: base ? `${base}/unicorn` : process.env.SMOKE_UNICORN_URL || 'http://localhost:8891',
}
const TIMEOUT_MS = 15000

// a 2x2 red PNG, so the API has to run it through sharp for a thumbnail
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEklEQVQImWO4Iyd3R06OAUIBACGmBGH6Pla+AAAAAElFTkSuQmCC',
  'base64'
)

const results = []
const check = async (name, fn) => {
  try {
    const detail = await fn()
    results.push({ name, ok: true })
    console.log(`  ok    ${name}${detail ? ` (${detail})` : ''}`)
  } catch (error) {
    results.push({ name, ok: false })
    console.log(`  FAIL  ${name}: ${error.message}`)
  }
}
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}
const withTimeout = (promise, label) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), TIMEOUT_MS)),
])

const http = async (url, options = {}) => {
  const res = await withTimeout(fetch(url, { redirect: 'manual', ...options }), url)
  const body = Buffer.from(await res.arrayBuffer())
  return { status: res.status, headers: res.headers, body, text: () => body.toString('utf8') }
}

const api = async (endpoint, token, body) => {
  const headers = { 'content-type': 'application/json' }
  if (token) headers.authorization = `Bearer ${Buffer.from(token).toString('base64')}`
  const res = await http(`${urls.api}${endpoint}`, body === undefined
    ? { headers }
    : { method: 'POST', headers, body: JSON.stringify(body) })
  let json = null
  try { json = JSON.parse(res.text()) } catch (e) {}
  return { status: res.status, json }
}

const newSession = async () => {
  const res = await api('/stub_user', null, {})
  assert(res.json && res.json.sessionToken, `stub_user returned ${res.status}`)
  return res.json.sessionToken
}

const hermesCreateNotepad = (token, roomRoute) => new Promise((resolve, reject) => {
  const socket = new WebSocket(urls.hermes)
  let nextId = 0
  const pending = new Map()
  const send = (kind, payload) => new Promise((res) => {
    const id = `smoke_${nextId++}`
    pending.set(id, res)
    socket.send(JSON.stringify({ id, kind, payload }))
  })
  socket.on('error', reject)
  socket.on('message', async (raw) => {
    const message = JSON.parse(raw.toString())
    if (message.kind === 'system' && message.payload && message.payload.socketReady) {
      try {
        const auth = await send('auth', { token, roomRoute })
        assert(auth.kind !== 'error', `hermes auth failed: ${JSON.stringify(auth.payload)}`)
        const created = await send('createWidget', {
          type: 'NOTEPAD',
          widgetState: { title: 'Smoke test notepad' },
          transform: { position: { x: 0, y: 0 }, size: { width: 400, height: 300 } },
        })
        assert(created.kind === 'widgetCreated', `createWidget returned ${created.kind}: ${JSON.stringify(created.payload)}`)
        resolve(created.payload.widgetId)
      } catch (error) {
        reject(error)
      } finally {
        socket.close()
      }
    } else if (message.requestId && pending.has(message.requestId)) {
      pending.get(message.requestId)(message)
      pending.delete(message.requestId)
    }
  })
})

// opens a ShareDB connection to unicorn carrying the session cookie
const unicornDoc = (token, docId) => {
  const socket = new WebSocket(toWs(urls.unicorn), {
    headers: token ? { cookie: `ndl_session=${encodeURIComponent(token)}` } : {},
  })
  const connection = new ShareDBClient.Connection(socket)
  const doc = connection.get('documents', String(docId))
  const call = (method, ...args) => withTimeout(new Promise((resolve, reject) => {
    doc[method](...args, (error) => (error ? reject(error) : resolve()))
  }), `unicorn ${method}`)
  return { doc, call, close: () => socket.close() }
}
const docText = (doc) => doc.data.ops.map((op) => (typeof op.insert === 'string' ? op.insert : '')).join('')

const main = async () => {
  console.log(`PopSpace smoke test: ui ${urls.ui}, api ${urls.api}, hermes ${urls.hermes}, unicorn ${urls.unicorn}\n`)
  const state = {}

  console.log('UI')
  await check('serves the app', async () => {
    const res = await http(`${urls.ui}/`)
    assert(res.status === 200 && res.text().includes('<div id="root">'), `got ${res.status}`)
    // built: /assets/index-<hash>.js; under the Vite dev server: /src/index.tsx
    state.scripts = [...res.text().matchAll(/<script[^>]* src="([^"]+\.(?:js|tsx?))"/g)].map((m) => m[1])
  })
  await check('serves its scripts with a single React version', async () => {
    assert(state.scripts && state.scripts.length, 'no scripts in index.html')
    const versions = new Set()
    for (const src of state.scripts) {
      const res = await http(new URL(src, urls.ui).href)
      assert(res.status === 200, `${src} returned ${res.status}`)
      // minifiers quote the version string with ", ' or `
      for (const m of res.text().matchAll(/["'`](1[6-9]\.\d+\.\d+)["'`]/g)) versions.add(m[1])
    }
    assert(!versions.has('18.3.1'), 'the bundle contains React 18 next to the app\'s React 17')
    return `${state.scripts.length} scripts`
  })

  console.log('API')
  await check('health and media providers', async () => {
    const health = await http(`${urls.api}/health`)
    assert(health.status === 200, `/health returned ${health.status}`)
    const providers = await api('/media_providers')
    assert(providers.json && providers.json.success, `/media_providers returned ${providers.status}`)
  })
  await check('creates a session', async () => {
    state.token = await newSession()
    const actor = await api('/actor', state.token)
    assert(actor.json && actor.json.actor, `/actor returned ${actor.status}`)
    return `actor ${actor.json.actor.actorId}`
  })
  await check('admin login', async () => {
    const { ADMIN_USERNAME: username, ADMIN_PASSWORD: password } = process.env
    assert(username && password, 'ADMIN_USERNAME / ADMIN_PASSWORD are not set')
    const res = await api('/admin_login', state.token, { username, password })
    assert(res.json && res.json.actor && res.json.actor.admin, `admin_login returned ${res.status}: ${res.json && res.json.message}`)
  })
  await check('creates a room', async () => {
    const res = await api('/create_meeting', state.token, { templateName: 'new' })
    const room = res.json && res.json.newMeeting
    assert(room && room.route && room.roomId, `create_meeting returned ${res.status}: ${res.json && res.json.message}`)
    state.room = room
    const list = await api('/admin/rooms', state.token)
    assert(list.json && list.json.rooms.some((r) => String(r.roomId) === String(room.roomId)), 'new room missing from /admin/rooms')
    return room.route
  })
  await check('uploads an image and serves it back to its owner only', async () => {
    assert(state.room, 'no room')
    const form = new FormData()
    form.append('roomRoute', state.room.route)
    form.append('file', new Blob([PNG], { type: 'image/png' }), 'smoke.png')
    const res = await withTimeout(fetch(`${urls.api}/upload_file`, {
      method: 'POST',
      headers: { authorization: `Bearer ${Buffer.from(state.token).toString('base64')}` },
      body: form,
    }), 'upload_file')
    const json = await res.json()
    assert(json.file && json.file.url, `upload_file returned ${res.status}: ${json.message}`)
    state.file = json.file
    // the thumbnail and dominant color come from sharp
    assert(json.file.thumbnailUrl && json.file.dominantColor, 'no thumbnail or dominant color, so sharp did not process the image')
    const ownerCookie = { cookie: `ndl_session=${encodeURIComponent(state.token)}` }
    const owner = await http(new URL(json.file.url, urls.api).href, { headers: ownerCookie })
    assert(owner.status === 200 && owner.body.equals(PNG), `owner download returned ${owner.status}`)
    const thumbnail = await http(new URL(json.file.thumbnailUrl, urls.api).href, { headers: ownerCookie })
    assert(thumbnail.status === 200 && thumbnail.body.subarray(1, 4).toString() === 'PNG', `thumbnail returned ${thumbnail.status}`)
    const strangerCookie = { cookie: `ndl_session=${encodeURIComponent(await newSession())}` }
    const stranger = await http(new URL(json.file.url, urls.api).href, { headers: strangerCookie })
    assert(stranger.status >= 400, `a stranger could download the file (${stranger.status})`)
    return `color ${json.file.dominantColor}, stranger got ${stranger.status}`
  })

  console.log('hermes')
  await check('health', async () => {
    const res = await http(`${urls.hermes.replace(/^ws/, 'http')}/health`)
    assert(res.status === 200, `got ${res.status}`)
  })
  await check('joins the room and creates a notepad', async () => {
    assert(state.room, 'no room')
    state.widgetId = await withTimeout(hermesCreateNotepad(state.token, state.room.route), 'hermes')
    return `widget ${state.widgetId}`
  })

  console.log('unicorn')
  await check('health, no X-Powered-By, image optimizer closed', async () => {
    const res = await http(`${urls.unicorn}/health`)
    assert(res.status === 200, `/health returned ${res.status}`)
    assert(!res.headers.get('x-powered-by'), `X-Powered-By: ${res.headers.get('x-powered-by')}`)
    const image = await http(`${urls.unicorn}/_next/image?url=%2Ffavicon.png&w=64&q=75`)
    assert(image.status === 404, `/_next/image returned ${image.status}`)
  })
  if (!base) {
    // behind the proxy the standalone editor page's /_next assets aren't routed to unicorn
    await check('editor page and its Next.js assets', async () => {
      const page = await http(`${urls.unicorn}/?docId=1`)
      assert(page.status === 200, `page returned ${page.status}`)
      const assets = [...new Set([...page.text().matchAll(/\/_next\/static\/[^"]+\.js/g)].map((m) => m[0]))]
      assert(assets.length, 'no Next.js scripts on the page')
      for (const asset of assets) {
        const res = await http(`${urls.unicorn}${asset}`)
        assert(res.status === 200, `${asset} returned ${res.status}`)
      }
      return `${assets.length} assets`
    })
  }
  await check('room member edits the notepad and the edit is saved', async () => {
    assert(state.widgetId, 'no notepad')
    const writer = unicornDoc(state.token, state.widgetId)
    try {
      await writer.call('fetch')
      if (!writer.doc.type) await writer.call('create', [{ insert: '\n' }], 'rich-text')
      await writer.call('submitOp', [{ insert: 'smoke test ' }])
    } finally {
      writer.close()
    }
    const reader = unicornDoc(state.token, state.widgetId)
    try {
      await reader.call('fetch')
      assert(docText(reader.doc).startsWith('smoke test '), `read back "${docText(reader.doc)}"`)
      return `version ${reader.doc.version}`
    } finally {
      reader.close()
    }
  })
  await check('stranger and anonymous clients are refused', async () => {
    assert(state.widgetId, 'no notepad')
    for (const [who, token] of [['stranger', await newSession()], ['anonymous', null]]) {
      const client = unicornDoc(token, state.widgetId)
      try {
        const error = await client.call('fetch').then(() => null, (e) => e)
        assert(error && error.code === 'ERR_FORBIDDEN', `${who} could read the notepad`)
      } finally {
        client.close()
      }
    }
  })

  console.log('cleanup')
  await check('deletes what the test created', async () => {
    if (state.file) {
      const res = await api('/delete_file', state.token, { fileId: state.file.id })
      assert(res.status === 200, `delete_file returned ${res.status}`)
    }
    if (state.room) {
      const res = await api('/admin/delete_room', state.token, { roomId: state.room.roomId })
      assert(res.status === 200, `delete_room returned ${res.status}`)
    }
    if (state.token) await api('/admin_logout', state.token, {})
  })

  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
