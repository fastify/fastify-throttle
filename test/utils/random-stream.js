'use strict'

const inherits = require('util').inherits
const Readable = require('stream').Readable

/**
 * Readable stream implementation that outputs random data very quickly
 * @param {number} bytes
 */
function RandomStream (bytes) {
  Readable.call(this)
  this.remaining = +bytes
}

inherits(RandomStream, Readable)

RandomStream.prototype._read = function (bytes, callback) {
  if (typeof callback !== 'function') {
    callback = function (e, b) {
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

module.exports = {
  RandomStream
}
