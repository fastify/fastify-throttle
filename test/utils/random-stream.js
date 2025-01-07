'use strict'

const Readable = require('node:stream').Readable

/**
 * Readable stream implementation that outputs random data very quickly
 * @param {number} bytes
 */
class RandomStream extends Readable {
  constructor (bytes) {
    super()
    this.remaining = +bytes
  }

  _read (bytes, callback) {
    if (typeof callback !== 'function') {
      callback = function (_e, b) {
        this.push(b)
      }.bind(this)
    }
    bytes = Math.min(this.remaining, bytes)
    this.remaining -= bytes
    const chunk = bytes !== 0
      ? Buffer.alloc(bytes)
      : null
    callback(null, chunk)
  }
}

module.exports = {
  RandomStream
}
