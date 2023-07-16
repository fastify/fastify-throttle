'use strict'

const fp = require('fastify-plugin')

const { ThrottleStream } = require('./lib/throttle-stream')
const { Readable, Stream } = require('stream')

function fastifyThrottle (fastify, options, done) {
  options = Object.assign({}, options)

  options.streamPayloads = options.streamPayloads ?? true
  options.bufferPayloads = options.bufferPayloads || false
  options.stringPayloads = options.stringPayloads || false

  fastify.addHook('onRoute', (routeOptions) => {
    const opts = Object.assign({}, options, routeOptions.config?.throttle)
    if (opts.bps) {
      addRouteThrottleHook(routeOptions, opts)
    }
  })
  done()
}

async function addRouteThrottleHook (routeOptions, throttleOptions) {
  const hook = 'onSend'
  const hookHandler = throttleOnSendHandler(throttleOptions)
  if (Array.isArray(routeOptions[hook])) {
    routeOptions[hook].push(hookHandler)
  } else if (typeof routeOptions[hook] === 'function') {
    routeOptions[hook] = [routeOptions[hook], hookHandler]
  } else {
    routeOptions[hook] = [hookHandler]
  }
}

function throttleOnSendHandler (throttleOpts) {
  const bps = throttleOpts.bps

  return function (request, reply, payload, done) {
    if (throttleOpts.streamPayloads && payload instanceof Stream) {
      const throttleStream = new ThrottleStream({ bps })
      payload.pipe(throttleStream)
      done(null, throttleStream)
      return
    }
    if (throttleOpts.bufferPayloads && Buffer.isBuffer(payload)) {
      const throttleStream = new ThrottleStream({ bps })
      Readable.from(payload).pipe(throttleStream)
      done(null, throttleStream)
      return
    }
    if (throttleOpts.stringPayloads && typeof payload === 'string') {
      const throttleStream = new ThrottleStream({ bps })
      Readable.from(Buffer.from(payload)).pipe(throttleStream)
      done(null, throttleStream)
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
