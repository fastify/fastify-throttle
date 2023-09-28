'use strict'

const { ThrottleStream } = require('./throttle-stream')

function ThrottleStreamGroupFactory (options) {
  const {
    store,
    ...opts
  } = options

  const throttleStream = new ThrottleStream(opts)
  const key = 'bla'

  throttleStream.lruState =store.lruState
  throttleStream.lruAllowedBytes =store.lruAllowedBytes
  throttleStream.initBytes = () => store.initBytes(key)
  throttleStream.getBytes = () => store.getBytes(key)
  throttleStream.increaseBytes = (value) => store.increaseBytes(key, value)
  throttleStream.setStartTime = (value) => store.setStartTime(key, value)
  throttleStream.decreaseAllowedBytes = (value) => store.decreaseAllowedBytes(key, value)
  throttleStream.getAllowedBytes = () => store.getAllowedBytes(key)
  throttleStream.setAllowedBytes = (value) => store.setAllowedBytes(key, value)

  return throttleStream
}

module.exports = {
  ThrottleStreamGroupFactory
}
