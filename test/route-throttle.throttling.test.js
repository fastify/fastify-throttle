'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const { fastifyThrottle } = require('../index')
const { assertTimespan } = require('./utils/assert-timespan')
const { RandomStream } = require('./utils/random-stream')

test('should throttle per route', async t => {
  t.plan(1)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: 1000
      }
    }
  }, (req, reply) => { reply.send(new RandomStream(3000)) })

  const startTime = Date.now()

  await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
})

test('should throttle per route and set the bytesPerSecond', async t => {
  t.plan(1)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: 10000
      }
    }
  }, (req, reply) => { reply.send(new RandomStream(30000)) })

  const startTime = Date.now()

  await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
})

test('should throttle per route and set the bytesPerSecond as function', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: (request) => {
          t.equal(request.headers['x-throttle-speed'], '10000')
          const bps = parseInt(request.headers['x-throttle-speed'], 10)
          return (elapsedTime, bytes) => {
            return bps
          }
        }
      }
    }
  }, (req, reply) => { reply.send(new RandomStream(30000)) })

  const startTime = Date.now()

  await fastify.inject({
    url: '/throttled',
    headers: {
      'x-throttle-speed': '10000'
    }
  })
  assertTimespan(t, startTime, Date.now(), 2000)
})

test('should throttle per route and set the bytesPerSecond as async function', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: async (request) => {
          t.equal(request.headers['x-throttle-speed'], '10000')
          const bps = parseInt(request.headers['x-throttle-speed'], 10)
          return (elapsedTime, bytes) => {
            return bps
          }
        }
      }
    }
  }, (req, reply) => { reply.send(new RandomStream(30000)) })

  const startTime = Date.now()

  await fastify.inject({
    url: '/throttled',
    headers: {
      'x-throttle-speed': '10000'
    }
  })
  assertTimespan(t, startTime, Date.now(), 2000)
})
