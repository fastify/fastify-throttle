'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const { fastifyThrottle } = require('../index')
const { assertTimespan } = require('./utils/assert-timespan')

test('should not throttle string payloads by default', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: 1000
      }
    }
  }, (_req, reply) => { reply.send(Buffer.alloc(1000).toString()) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 50, 100)
  t.assert.deepStrictEqual(response.body.length, 1000)
})

test('should not throttle strings payloads if stringPayloads is set to false', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        stringPayloads: false,
        bytesPerSecond: 1000
      }
    }
  }, (_req, reply) => { reply.send(Buffer.alloc(1000).toString()) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 50, 100)
  t.assert.deepStrictEqual(response.body.length, 1000)
})

test('should throttle string payloads when stringPayloads is true', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: 1000,
        stringPayloads: true
      }
    }
  }, (_req, reply) => { reply.send(Buffer.alloc(3000).toString()) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
  t.assert.deepStrictEqual(response.body.length, 3000)
})

test('should throttle string payloads when stringPayloads is true and bytesPerSecond is a function', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: () => () => 1000,
        stringPayloads: true
      }
    }
  }, (_req, reply) => { reply.send(Buffer.alloc(3000).toString()) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
  t.assert.deepStrictEqual(response.body.length, 3000)
})

test('should throttle string payloads when stringPayloads is true and bytesPerSecond is an async function', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: async () => () => 1000,
        stringPayloads: true
      }
    }
  }, (_req, reply) => { reply.send(Buffer.alloc(3000).toString()) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
  t.assert.deepStrictEqual(response.body.length, 3000)
})
