'use strict'

const { Transform } = require('stream')

/**
 * The `ThrottleStream` is very similar to the node core
 * `stream.Transform` stream, except that you specify a `bytesPerSecond` "bytes per
 * second" option and data *will not* be passed through faster than the byte
 * value you specify.
 *
 * You can invoke it with a function for `bytesPerSecond` that takes the elapsed time (in seconds)
 * and the number of bytes already sent as parameters. The function should return
 * the desired bytes per second value.
 *
 * @param {Object} opts an options object or the "bytesPerSecond" function value
 * @api public
 * @constructor ThrottleStream
 * @extends Transform
 * @param {Object} [opts] - options
 * @param {number|Function} [opts.bytesPerSecond] - number or function that returns bytes per second to throttle to
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
   * @name bytesPerSecondFn
   * @default null
   */
  this.bytesPerSecondFn = opts?.bytesPerSecond === undefined
    ? function bytesPerSecondFn (_elapsedTime, _bytes) {
      return 16384
    }
    : typeof opts.bytesPerSecond === 'number'
      ? function bytesPerSecondFn (_elapsedTime, _bytes) {
        return opts.bytesPerSecond
      }
      : opts.bytesPerSecond

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
   * @default null
   */
  this.bytes = null

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
   * Number of bytes allowed to be pushed to the next stream
   * @type {number}
   * @private
   * @default null
   */
  this._allowedBytes = null

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
ThrottleStream.prototype._transform = async function _transform (chunk, encoding, callback) {
  chunk && (this._buffer = chunk)
  callback && (this._callback = callback)

  try {
    this.startTime === null && (await this._init())

    let allowedBytes = await this.getAllowedBytes()
    if (allowedBytes !== 0) {
      const chunkLength = this._buffer.length
      if (chunkLength <= allowedBytes) {
        await this.decreaseAllowedBytes(chunkLength)
        await this.increaseBytes(chunkLength)
        this.push(this._buffer)
        this._buffer = null
        this._callback()
        return
      }

      allowedBytes = await this.getAllowedBytes()
      await this.setAllowedBytes(0)
      await this.increaseBytes(allowedBytes)
      this.push(this._buffer.subarray(0, allowedBytes))
      this._buffer = this._buffer.subarray(allowedBytes)
    }
  } catch (err) {
    // Pass the error to the callback to handle it in the stream
    this._callback(err)
  }
}

ThrottleStream.prototype._init = async function _init () {
  try {
    await this.setStartTime(Date.now())
    const bytes = await this.initBytes(0)
    await this.setAllowedBytes(0)

    this._allowedBytes = this.bytesPerSecondFn(0, bytes)
    this._interval = setInterval(() => intervalHandler(this), 1000)
  } catch (err) {
    // Handle any errors during initialization
    this.emit('error', err)
  }
}

ThrottleStream.prototype._destroy = function _destroy (err, cb) {
  clearInterval(this._interval)
  this._buffer = null
  this._callback = null

  cb(err)
}

/**
 * @param {number} value
 * @returns {Promise<number>}
 */
ThrottleStream.prototype.setAllowedBytes = async function setAllowedBytes (value) {
  this._allowedBytes = value
  return this._allowedBytes
}

/**
 * @param {number} value
 * @returns {Promise<number>}
 */
ThrottleStream.prototype.getAllowedBytes = async function getAllowedBytes () {
  return this._allowedBytes
}

/**
 * @param {number} value
 * @returns {Promise<number>}
 */
ThrottleStream.prototype.decreaseAllowedBytes = async function decreaseAllowedBytes (value) {
  this._allowedBytes -= value
  return this._allowedBytes
}

/**
 * @param {number} value
 * @returns {Promise<number>}
 */
ThrottleStream.prototype.setStartTime = async function setStartTime (value) {
  this.startTime = value
  return this.startTime
}

/**
 * @returns {Promise<number>}
 */
ThrottleStream.prototype.getBytes = async function getBytes () {
  return this.bytes
}

/**
 * @param {number} value
 * @returns {Promise<number>}
 */
ThrottleStream.prototype.initBytes = async function initBytes () {
  this.bytes = 0
  return this.bytes
}

/**
 * @param {number} value
 * @returns {Promise<number>}
 */
ThrottleStream.prototype.increaseBytes = async function increaseBytes (value) {
  this.bytes += value
  return this.bytes
}

/**
 * @param {ThrottleStream} instance
 */
async function intervalHandler (instance) {
  try {
    const bytes = await instance.getBytes()
    const allowedBytes = await instance.setAllowedBytes(instance.bytesPerSecondFn((Date.now() - instance.startTime) / 1000, bytes))

    if (
      allowedBytes !== 0 &&
      instance._buffer !== null
    ) {
      setImmediate(() => instance._transform())
    }
  } catch (err) {
    // Handle any errors during interval updates
    instance.emit('error', err)
  }
}

module.exports = {
  ThrottleStream
}
