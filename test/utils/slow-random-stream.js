'use strict'

const inherits = require('util').inherits
const Readable = require('stream').Readable

/**
 * Readable stream impl that outputs random data with a 100 ms delay per byte
 * @param {number} bytes
 * @param {number} [delay=100]
 */
function SlowRandomStream (bytes, delay = 100) {
  Readable.call(this)
  this.remaining = +bytes
  this.delay = delay
}

inherits(SlowRandomStream, Readable)

SlowRandomStream.prototype._read = function (bytes, callback) {
  if (typeof callback !== 'function') callback = function (e, b) { this.push(b) }.bind(this)
  bytes = 1
  this.remaining -= bytes
  if (this.remaining >= 0) {
    setTimeout(callback.bind(null, null, Buffer.alloc(bytes)), this.delay)
  } else {
    callback(null, null) // emit "end"
  }
}

module.exports = {
  SlowRandomStream
}
