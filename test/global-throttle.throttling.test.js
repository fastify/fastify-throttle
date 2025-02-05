'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const { fastifyThrottle } = require('../index')
const { assertTimespan } = require('./utils/assert-timespan')
const { RandomStream } = require('./utils/random-stream')

test('should throttle globally', async t => {
  t.plan(1)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle, {
    bytesPerSecond: 1000
  })

  fastify.get('/throttled', (_req, reply) => { reply.send(new RandomStream(3000)) })

  const startTime = Date.now()

  await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
})

test('should throttle globally and set the bytesPerSecond', async t => {
  t.plan(1)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle, {
    bytesPerSecond: 10000
  })

  fastify.get('/throttled', (_req, reply) => { reply.send(new RandomStream(30000)) })

  const startTime = Date.now()

  await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
})

test('should throttle globally and set the bytesPerSecond function', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle, {
    bytesPerSecond: (request) => {
      t.assert.deepStrictEqual(request.headers['x-throttle-speed'], '10000')
      const bps = parseInt(request.headers['x-throttle-speed'], 10)
      return () => {
        return bps
      }
    }
  })

  fastify.get('/throttled', (_req, reply) => { reply.send(new RandomStream(30000)) })

  const startTime = Date.now()

  await fastify.inject({
    url: '/throttled',
    headers: {
      'x-throttle-speed': '10000'
    }
  })
  assertTimespan(t, startTime, Date.now(), 2000)
})

test('should throttle globally and set the bytesPerSecond async function', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle, {
    bytesPerSecond: async (request) => {
      t.assert.deepStrictEqual(request.headers['x-throttle-speed'], '10000')
      const bps = parseInt(request.headers['x-throttle-speed'], 10)
      return () => {
        return bps
      }
    }
  })

  fastify.get('/throttled', (_req, reply) => { reply.send(new RandomStream(30000)) })

  const startTime = Date.now()

  await fastify.inject({
    url: '/throttled',
    headers: {
      'x-throttle-speed': '10000'
    }
  })
  assertTimespan(t, startTime, Date.now(), 2000)
})
