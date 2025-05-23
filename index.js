'use strict'

const fp = require('fastify-plugin')

const { isAsyncFunction } = require('./lib/is-async-function')
const { ThrottleStream } = require('./lib/throttle-stream')
const { Readable, Stream, pipeline } = require('node:stream')

function fastifyThrottle (fastify, options, done) {
  options = Object.assign({}, options)

  options.streamPayloads = options.streamPayloads ?? true
  options.bufferPayloads = options.bufferPayloads || false
  options.stringPayloads = options.stringPayloads || false
  options.async = options.async || false

  fastify.addHook('onRoute', (routeOptions) => {
    const opts = Object.assign({}, options, routeOptions.config?.throttle)
    if (opts.bytesPerSecond) {
      addRouteThrottleHook(fastify, routeOptions, opts)
    }
  })
  done()
}

async function addRouteThrottleHook (fastify, routeOptions, throttleOptions) {
  const hook = 'onSend'
  const hookHandler = throttleOnSendHandler(fastify, throttleOptions)
  if (Array.isArray(routeOptions[hook])) {
    routeOptions[hook].push(hookHandler)
  } else if (typeof routeOptions[hook] === 'function') {
    routeOptions[hook] = [routeOptions[hook], hookHandler]
  } else {
    routeOptions[hook] = [hookHandler]
  }
}

function throttleOnSendHandler (fastify, throttleOpts) {
  const bytesPerSecond = throttleOpts.bytesPerSecond
  const pipelineCallback = err => err && fastify.log.error(err)

  if (typeof bytesPerSecond === 'number') {
    return async function onSendHandler (_request, _reply, payload) {
      if (throttleOpts.streamPayloads && payload instanceof Stream) {
        return pipeline(
          payload,
          new ThrottleStream({ bytesPerSecond }),
          pipelineCallback
        )
      }
      if (throttleOpts.bufferPayloads && Buffer.isBuffer(payload)) {
        return pipeline(
          Readable.from(payload),
          new ThrottleStream({ bytesPerSecond }),
          pipelineCallback
        )
      }
      if (throttleOpts.stringPayloads && typeof payload === 'string') {
        return pipeline(
          Readable.from(Buffer.from(payload)),
          new ThrottleStream({ bytesPerSecond }),
          pipelineCallback
        )
      }
      return payload
    }
  } else if (throttleOpts.async || isAsyncFunction(bytesPerSecond)) {
    return async function onSendHandler (request, _reply, payload) {
      if (throttleOpts.streamPayloads && payload instanceof Stream) {
        return pipeline(
          payload,
          new ThrottleStream({ bytesPerSecond: await bytesPerSecond(request) }),
          pipelineCallback
        )
      }
      if (throttleOpts.bufferPayloads && Buffer.isBuffer(payload)) {
        return pipeline(
          Readable.from(payload),
          new ThrottleStream({ bytesPerSecond: await bytesPerSecond(request) }),
          pipelineCallback
        )
      }
      if (throttleOpts.stringPayloads && typeof payload === 'string') {
        return pipeline(
          Readable.from(Buffer.from(payload)),
          new ThrottleStream({ bytesPerSecond: await bytesPerSecond(request) }),
          pipelineCallback
        )
      }
      return payload
    }
  } else {
    return async function onSendHandler (request, _reply, payload) {
      if (throttleOpts.streamPayloads && payload instanceof Stream) {
        return pipeline(
          payload,
          new ThrottleStream({ bytesPerSecond: bytesPerSecond(request) }),
          pipelineCallback
        )
      }
      if (throttleOpts.bufferPayloads && Buffer.isBuffer(payload)) {
        return pipeline(
          Readable.from(payload),
          new ThrottleStream({ bytesPerSecond: bytesPerSecond(request) }),
          pipelineCallback
        )
      }
      if (throttleOpts.stringPayloads && typeof payload === 'string') {
        return pipeline(
          Readable.from(Buffer.from(payload)),
          new ThrottleStream({ bytesPerSecond: bytesPerSecond(request) }),
          pipelineCallback
        )
      }
      return payload
    }
  }
}

module.exports = fp(fastifyThrottle, {
  fastify: '5.x',
  name: '@fastify/throttle'
})
module.exports.default = fastifyThrottle
module.exports.fastifyThrottle = fastifyThrottle
