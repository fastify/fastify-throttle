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
  }, (req, reply) => { reply.send(new RandomStream(3000)) })

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
  }, (req, reply) => { reply.send(new RandomStream(3000)) })

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
  }, (req, reply) => { reply.send(new RandomStream(3000)) })

  const startTime = Date.now()

  const response = await fastify.inject('/')
  assertTimespan(t, startTime, Date.now(), 20, 100)
  t.equal(response.body.length, 3000)
})
