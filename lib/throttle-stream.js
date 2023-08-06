'use strict'

const { Transform } = require('stream')

/**
 * The `ThrottleStream` is very similar to the node core
 * `stream.Transform` stream, except that you specify a `bps` "bytes per
 * second" option and data *will not* be passed through faster than the byte
 * value you specify.
 *
 * You can invoke it with a function for `bps` that takes the elapsed time (in seconds)
 * and the number of bytes already sent as parameters. The function should return
 * the desired bytes per second value.
 *
 * @param {Object} opts an options object or the "bps" function value
 * @api public
 * @constructor ThrottleStream
 * @extends Transform
 * @param {Object} [opts] - options
 * @param {number|Function} [opts.bps] - number or function that returns bytes per second to throttle to
 */
function ThrottleStream (opts) {
  if (!new.target) {
    return new ThrottleStream(opts)
  }

  Transform.call(this, opts)

  /**
   * The function to calculate bytes per second to throttle to
   * @type {Function}
   * @public
   * @memberof ThrottleStream
   * @name bpsFn
   * @default null
   */
  this.bpsFn = typeof opts?.bps === 'undefined'
    ? function bpsFn (_elapsedTime, _bytes) {
      return 16384
    }
    : typeof opts.bps === 'number'
      ? function bpsFn (_elapsedTime, _bytes) {
        return opts.bps
      }
      : opts.bps

  /**
   * The time that the stream started
   * @type {number}
   * @public
   * @memberof ThrottleStream
   * @name startTime
   * @default null
   */
  this.startTime = null

  /**
   * The number of bytes that have been sent through the stream
   * @type {number}
   * @public
   * @memberof ThrottleStream
   * @name bytes
   * @default 0
   */
  this.bytes = 0

  /**
   * The buffered chunk.
   * @type {Buffer}
   * @private
   * @memberof ThrottleStream
   * @name _buffer
   * @default null
   */
  this._buffer = null

  this._interval = null

  /**
   * Number of bytes allowed to be passed
   * @type {number}
   * @private
   * @default 0
   */
  this._allowedBytes = 0

  this._callback = null
}

ThrottleStream.prototype = Object.create(Transform.prototype, {
  constructor: {
    value: ThrottleStream,
    enumerable: false,
    writable: true,
    configurable: true
  }
})

/**
 * The internal `_transform` function is called by the `write` function of the
 * `Transform` stream base class. This function is not intended to be called
 * directly.
 * @param {Buffer} chunk
 * @param {string} encoding
 * @param {Function} fn
 */
ThrottleStream.prototype._transform = function (chunk, encoding, callback) {
  if (this.startTime === null) {
    this._init()
  }

  this._buffer = chunk
  this._callback = callback

  if (this._allowedBytes !== 0) {
    this._process()
  }
}

ThrottleStream.prototype._init = function () {
  this.startTime = Date.now()

  this._allowedBytes = this.bpsFn(0, 0)
  this._interval = setInterval(() => {
    this._allowedBytes = this.bpsFn((Date.now() - this.startTime) / 1000, this.bytes)

    if (
      this._allowedBytes !== 0 &&
      this._buffer !== null
    ) {
      setImmediate(() => this._process())
    }
  }, 1000)
  this.once('end', () => {
    clearInterval(this._interval)
    this._buffer = null
    this._callback = null
  })
}

ThrottleStream.prototype._process = function () {
  const chunkLength = this._buffer.length
  if (chunkLength <= this._allowedBytes) {
    this._allowedBytes -= chunkLength
    this.push(this._buffer)
    this._buffer = null
    this._callback()
    return
  }

  const allowedBytes = this._allowedBytes
  this._allowedBytes = 0
  this.push(this._buffer.subarray(0, allowedBytes))
  this._buffer = this._buffer.subarray(allowedBytes)
}

module.exports = {
  ThrottleStream
}
