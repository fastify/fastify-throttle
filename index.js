'use strict'

const fp = require('fastify-plugin')

const { ThrottleStreamGroupFactory } = require('./lib/throttle-stream-group')
const { MemoryStore } = require('./store/memory-store')
const { ThrottleStream } = require('./lib/throttle-stream')
const { Readable, Stream, pipeline } = require('stream')

function fastifyThrottle(fastify, options, done) {
  options = Object.assign({}, options)

  options.streamPayloads = options.streamPayloads ?? true
  options.bufferPayloads = options.bufferPayloads || false
  options.stringPayloads = options.stringPayloads || false
  options.store = new MemoryStore()

  fastify.addHook('onRoute', (routeOptions) => {
    const opts = Object.assign({}, options, routeOptions.config?.throttle)
    if (opts.bytesPerSecond) {
      addRouteThrottleHook(fastify, routeOptions, opts)
    }
  })
  done()
}

async function addRouteThrottleHook(fastify, routeOptions, throttleOptions) {
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

function throttleOnSendHandler(fastify, throttleOpts) {
  const bytesPerSecond = throttleOpts.bytesPerSecond

  return function onSendHandler(request, reply, payload, done) {
    if (throttleOpts.streamPayloads && payload instanceof Stream) {
      done(null, pipeline(
        payload,
        ThrottleStreamGroupFactory({ bytesPerSecond , store: throttleOpts.store}),
        err => { fastify.log.error(err) }
      ))
      return
    }
    if (throttleOpts.bufferPayloads && Buffer.isBuffer(payload)) {
      done(null, pipeline(
        Readable.from(payload),
        ThrottleStreamGroupFactory({ bytesPerSecond , store: throttleOpts.store}),
        err => { fastify.log.error(err) }
      ))
      return
    }
    if (throttleOpts.stringPayloads && typeof payload === 'string') {
      done(null, pipeline(
        Readable.from(Buffer.from(payload)),
        ThrottleStreamGroupFactory({ bytesPerSecond }),
        err => { fastify.log.error(err) }
      ))
      return
    }
    done(null, payload)
  }
}

module.exports = fp(fastifyThrottle, {
  fastify: '4.x',
  name: '@fastify/throttle'
})
module.exports.default = fastifyThrottle
module.exports.fastifyThrottle = fastifyThrottle
