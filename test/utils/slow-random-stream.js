'use strict'

const Readable = require('stream').Readable

/**
 * Readable stream impl that outputs random data with a 100 ms delay per byte
 * @param {number} bytes
 * @param {number} [delay=100]
 */
class SlowRandomStream extends Readable {
  constructor (bytes, delay = 100) {
    super()
    this.remaining = +bytes
    this.delay = delay
  }

  _read (bytes, callback) {
    if (typeof callback !== 'function') callback = function (e, b) { this.push(b) }.bind(this)
    bytes = 1
    this.remaining -= bytes
    if (this.remaining >= 0) {
      setTimeout(callback.bind(null, null, Buffer.alloc(bytes)), this.delay)
    } else {
      callback(null, null) // emit "end"
    }
  }
}

module.exports = {
  SlowRandomStream
}
