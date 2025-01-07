'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const { fastifyThrottle } = require('../index')
const { assertTimespan } = require('./utils/assert-timespan')
const { RandomStream } = require('./utils/random-stream')

test('should throttle streams payloads by default', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: 1000
      }
    }
  }, (_req, reply) => { reply.send(new RandomStream(3000)) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
  t.equal(response.body.length, 3000)
})

test('should throttle streams payloads if streamPayloads is set to true', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: 1000,
        streamPayloads: true
      }
    }
  }, (_req, reply) => { reply.send(new RandomStream(3000)) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
  t.equal(response.body.length, 3000)
})

test('should throttle streams payloads if streamPayloads is set to true and bytesPerSecond is a function', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: () => () => 1000,
        streamPayloads: true
      }
    }
  }, (_req, reply) => { reply.send(new RandomStream(3000)) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
  t.equal(response.body.length, 3000)
})

test('should throttle streams payloads if streamPayloads is set to true and bytesPerSecond is an async function', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: async () => () => 1000,
        streamPayloads: true
      }
    }
  }, (_req, reply) => { reply.send(new RandomStream(3000)) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
  t.equal(response.body.length, 3000)
})

test('should throttle streams payloads if streamPayloads is set to true and bytesPerSecond is an sync function and async is set to true', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: () => Promise.resolve(() => 1000),
        async: true,
        streamPayloads: true
      }
    }
  }, (_req, reply) => { reply.send(new RandomStream(3000)) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
  t.equal(response.body.length, 3000)
})

test('should not throttle streams payloads if streamPayloads is set to false', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/', {
    config: {
      throttle: {
        bytesPerSecond: 1000,
        streamPayloads: false
      }
    }
  }, (_req, reply) => { reply.send(new RandomStream(3000)) })

  const startTime = Date.now()

  const response = await fastify.inject('/')
  assertTimespan(t, startTime, Date.now(), 50, 100)
  t.equal(response.body.length, 3000)
})

test('should not throttle streams payloads if streamPayloads is set to false', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/', {
    config: {
      throttle: {
        bytesPerSecond: () => () => 1000,
        streamPayloads: false
      }
    }
  }, (_req, reply) => { reply.send(new RandomStream(3000)) })

  const startTime = Date.now()

  const response = await fastify.inject('/')
  assertTimespan(t, startTime, Date.now(), 50, 100)
  t.equal(response.body.length, 3000)
})

test('should not throttle streams payloads if streamPayloads is set to false and bytesPerSecond is a function returning a Promise', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: () => Promise.resolve(() => 1000),
        streamPayloads: false,
        async: true
      }
    }
  }, (_req, reply) => { reply.send(new RandomStream(3000)) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 50, 100)
  t.equal(response.body.length, 3000)
})

test('should not crash if async is set to true and bytesPerSecond is an sync function returning a rejected Promise', async t => {
  t.plan(1)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: () => Promise.reject(new Error('Arbitrary Error')),
        async: true
      }
    }
  }, (_req, reply) => { reply.send(new RandomStream(3000)) })

  const response = await fastify.inject('/throttled')
  t.equal(response.statusCode, 500)
})
