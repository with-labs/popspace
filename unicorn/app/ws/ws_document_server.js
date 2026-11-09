const WebSocket = require('ws')
const WebSocketJSONStream = require('@teamwork/websocket-json-stream')
const ShareDB = require('sharedb')

const AsyncLock = require('async-lock')
const lock = new AsyncLock()

const HEARTBEAT_TIMEOUT_MILLIS = 60000
const HEARTBEAT_INTERVAL = 30000

class WsDocumentServer {
  constructor() {
    this.connectionCount = 0
    this.curClientId = 0
  }

  async connect(server) {
    if(this.wss) {
      return
    }
    if(!WsDocumentServer.initialized) {
      await WsDocumentServer.init()
    }

    const heartbeat = function () {
      log.app.info(`pong ${this.clientId}`)
      this.isAlive = true
    }

    this.wss = new WebSocket.Server({ server })
    this.startHeartbeatLoop()
    this.wss.on('connection', (ws, req) => {
      ws.on('error', (err) => {
        log.error.info(err);
      });
      ws.on('pong', heartbeat);

      ws.clientId = this.curClientId++
      this.connectionCount++
      log.app.info(`Connection opened ${this.connectionCount}`)

      ws.on('close', () => {
        this.connectionCount--
        log.app.info(`Connection closed ${this.connectionCount}`)
      })

      const jsonStream = new WebSocketJSONStream(ws)
      jsonStream.on('error', (error) => {
        /*
          Error event must be handled, or it will be throw when calling
          (see https://github.com/Teamwork/websocket-json-stream)
        */
        log.error.info(error)
        try {
          /*
            ShareDB will perform cleanup automatically,
            e.g. "unlisten" to the stream
            https://github.com/share/sharedb/issues/345
          */
          jsonStream.destroy(error)
        } catch(destroyError) {
          /*
            This shouldn't happen, but
            we don't want the server to die if it does.
          */
          log.error.error(destroyError)
        }
      })
      // the upgrade request carries the session cookie used for authorization
      WsDocumentServer.shareDBServer.listen(jsonStream, req)
    })
  }

  startHeartbeatLoop() {
    /*
      https://github.com/websockets/ws/pull/635#issuecomment-281026825
      https://github.com/websockets/ws/blob/HEAD/doc/ws.md#websocketpingdata-mask-callback

      Another example of heartbeats in the official package npm:
      https://www.npmjs.com/package/ws#how-to-detect-and-close-broken-connections

      ping/pong in WS standard:
      https://datatracker.ietf.org/doc/html/rfc6455#page-37
    */
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate()
        ws.isAlive = false
        ws.ping('')
      })
    }, HEARTBEAT_INTERVAL)
  }
}

WsDocumentServer.initialized = false

WsDocumentServer.init = async () => {
  return await lock.acquire('sharedb_server_init', async () => {
    if(WsDocumentServer.initialized) {
      return
    }
    /*
      By Default Sharedb uses JSON0 OT type.
      rich-text makes it compatible with the quill editor -
      they were built together for each other.
    */
    WsDocumentServer.initialized = true
    ShareDB.types.register(require('rich-text').type)
    WsDocumentServer.shareDBServer = new ShareDB({db: blib.db.sharedbSQLite})
    WsDocumentServer.useAuthorization(WsDocumentServer.shareDBServer)
    WsDocumentServer.connection = WsDocumentServer.shareDBServer.connect()
  })
}

/*
  Documents belong to notepad widgets: the document id is the widget id.
  Only members of the widget's room (plus its creator and admins) may read
  or edit it. Access is resolved once per document per connection.
*/
const DOCUMENT_COLLECTION = 'documents'

const forbidden = () => {
  const error = new Error('Forbidden')
  error.code = 'ERR_FORBIDDEN'
  return error
}

const canAccessDocument = async (agent, collection, id) => {
  // server-side connections created with backend.connect()
  if (agent.stream && agent.stream.isServer) {
    return true
  }
  const { actor, allowed } = agent.custom
  if (!actor || collection !== DOCUMENT_COLLECTION) {
    return false
  }
  if (allowed.has(id)) {
    return allowed.get(id)
  }
  let result = false
  const widgetId = Number(id)
  if (Number.isSafeInteger(widgetId)) {
    const roomWidget = await shared.db.prisma.roomWidget.findUnique({ where: { widgetId } })
    if (roomWidget) {
      const room = await shared.db.room.core.roomById(roomWidget.roomId)
      result = await shared.db.room.permissions.canAccessContent(actor, room)
    }
  }
  allowed.set(id, result)
  return result
}

WsDocumentServer.useAuthorization = (backend) => {
  backend.use('connect', async (ctx, next) => {
    try {
      const actor = ctx.req ? await shared.lib.sessionCookie.actorFromRequest(ctx.req) : null
      ctx.agent.custom = { actor, allowed: new Map() }
      next()
    } catch (error) {
      next(error)
    }
  })

  backend.use('readSnapshots', async (ctx, next) => {
    try {
      for (const snapshot of ctx.snapshots) {
        if (!(await canAccessDocument(ctx.agent, ctx.collection, snapshot.id))) {
          ctx.rejectSnapshotRead(snapshot, forbidden())
        }
      }
      next()
    } catch (error) {
      next(error)
    }
  })

  backend.use('op', async (ctx, next) => {
    try {
      next(await canAccessDocument(ctx.agent, ctx.collection, ctx.id) ? undefined : forbidden())
    } catch (error) {
      next(error)
    }
  })

  backend.use('submit', async (ctx, next) => {
    try {
      next(await canAccessDocument(ctx.agent, ctx.collection, ctx.id) ? undefined : forbidden())
    } catch (error) {
      next(error)
    }
  })

  // the notepad only opens documents by id; queries could list every document
  backend.use('query', (ctx, next) => {
    if (ctx.agent.stream && ctx.agent.stream.isServer) {
      return next()
    }
    next(forbidden())
  })
}

module.exports = WsDocumentServer
