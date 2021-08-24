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
    this.wss.on('connection', (ws) => {
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
      /*
        TODO: require authorization
        ws.on('message', () => (...))
      */
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
      WsDocumentServer.shareDBServer.listen(jsonStream)
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
    WsDocumentServer.shareDBServer = new ShareDB({db: blib.db.sharedbPostgres})
    WsDocumentServer.connection = WsDocumentServer.shareDBServer.connect()
  })
}

module.exports = WsDocumentServer
