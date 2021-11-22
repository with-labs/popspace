const { Duplex } = require('stream')

const CONNECTING = 0
const OPEN = 1
const CLOSING = 2
const CLOSED = 3

const NORMAL_CLOSURE_CODE = 1000
const NORMAL_CLOSURE_REASON = 'stream end'
const INTERNAL_ERROR_CODE = 1011
const INTERNAL_ERROR_REASON = 'stream error'

/*
  Forked from https://github.com/Teamwork/websocket-json-stream

  We are likely to need to handle various disconnect states in a custom way.
*/
module.exports = class WebSocketJSONStream extends Duplex {
  constructor(ws) {
    super({
      objectMode: true,
      allowHalfOpen: false,
      emitClose: false
    })

    this._emittedClose = false
    this.ws = ws;

    this.ws.addEventListener('message', ({ data }) => {
      let value

      try {
        value = JSON.parse(data)
      } catch (error) {
        return this.destroy(error)
      }

      if (value == null) {
        return this.destroy(new Error('Can\'t JSON.parse the value'))
      }

      this.push(value)
    })

    this.ws.addEventListener('close', () => {
      this.destroy()
    })
  }

  _read() {}

  _write(object, encoding, callback) {
    let json

    try {
      json = JSON.stringify(object)
    } catch (error) {
      return callback(error)
    }

    if (typeof json !== 'string') {
      return callback(new Error('Can\'t JSON.stringify the value'))
    }

    this._send(json, callback)
  }

  _send(json, callback) {
    if (this.ws.readyState === CONNECTING) {
      const send = () => {
        this.ws.removeEventListener('open', send)
        this.ws.removeEventListener('close', send)
        this._send(json, callback)
      }
      this.ws.addEventListener('open', send)
      this.ws.addEventListener('close', send)

    } else if (this.ws.readyState === OPEN) {
      this.ws.send(json, callback)
    } else {
      const error = new Error('WebSocket CLOSING or CLOSED.')
      error.name = 'Error [ERR_CLOSED]'

      return callback(error)
    }
  }

  _final(callback) {
    /*
     * 1000 indicates a normal closure, meaning that the purpose for which
     * the connection was established has been fulfilled.
     * https://tools.ietf.org/html/rfc6455#section-7.4.1
     */
    this._closeWebSocket(NORMAL_CLOSURE_CODE, NORMAL_CLOSURE_REASON, callback)
  }

  _destroy(error, callback) {
    /*
     * Calling destroy without an error object will close the stream
     * without a code. This results in the client emitting a CloseEvent
     * that has code 1005.
     *
     * 1005 is a reserved value and MUST NOT be set as a status code in a
     * Close control frame by an endpoint.  It is designated for use in
     * applications expecting a status code to indicate that no status
     * code was actually present.
     * https://tools.ietf.org/html/rfc6455#section-7.4.1
     */
    let code
    let reason

    if (error) {

      /*
       * 1011 indicates that a remote endpoint is terminating the
       * connection because it encountered an unexpected condition that
       * prevented it from fulfilling the request.
       * http://www.rfc-editor.org/errata_search.php?eid=3227
       */
      code = error.closeCode || INTERNAL_ERROR_CODE
      reason = error.closeReason || INTERNAL_ERROR_REASON
    }
    this._closeWebSocket(code, reason, () => callback(error))
  }

  _closeWebSocket(code, reason, callback) {
    switch (this.ws.readyState) {
      case CONNECTING: {
        const close = () => {
          this.ws.removeEventListener('open', close)
          this.ws.removeEventListener('close', close)
          this._closeWebSocket(code, reason, callback)
        }
        this.ws.addEventListener('open', close)
        this.ws.addEventListener('close', close)
        break
      }
      case OPEN: {
        const closed = () => {
          this.ws.removeEventListener('close', closed)
          this._closeWebSocket(code, reason, callback)
        }
        this.ws.addEventListener('close', closed)
        this.ws.close(code, reason)
        break
      }
      case CLOSING: {
        const closed = () => {
          this.ws.removeEventListener('close', closed)
          this._closeWebSocket(code, reason, callback)
        }
        this.ws.addEventListener('close', closed)
        break
      }
      case CLOSED: {
        process.nextTick(() => {
          if (!this._emittedClose) {
            this._emittedClose = true
            this.emit('close')
          }

          return callback()
        })
        break
      }
      /* istanbul ignore next */
      default: {
        process.nextTick(() => callback(new Error(`Unexpected readyState: ${this.ws.readyState}`)))
        break
      }
    }
  }
}
