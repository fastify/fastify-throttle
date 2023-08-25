'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const { fastifyThrottle } = require('../index')
const { assertTimespan } = require('./utils/assert-timespan')

test('should not throttle Buffer payloads if bufferPayloads is not set', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/', {
    config: {
      throttle: {
        bytesPerSecond: 1000
      }
    }
  }, (req, reply) => { reply.send(Buffer.alloc(1000)) })

  const startTime = Date.now()

  const response = await fastify.inject('/')
  assertTimespan(t, startTime, Date.now(), 50, 100)
  t.equal(response.body.length, 1000)
})

test('should not throttle Buffer payloads if bufferPayloads is set to false', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/', {
    config: {
      throttle: {
        bytesPerSecond: 1000,
        bufferPayloads: false
      }
    }
  }, (req, reply) => { reply.send(Buffer.alloc(1000)) })

  const startTime = Date.now()

  const response = await fastify.inject('/')
  assertTimespan(t, startTime, Date.now(), 50, 100)
  t.equal(response.body.length, 1000)
})

test('should throttle Buffer payloads if bufferPayloads is set to true', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: 1000,
        bufferPayloads: true
      }
    }
  }, (req, reply) => { reply.send(Buffer.alloc(3000)) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
  t.equal(response.body.length, 3000)
})
