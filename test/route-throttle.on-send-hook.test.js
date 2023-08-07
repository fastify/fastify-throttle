'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const { fastifyThrottle } = require('../index')
const { assertTimespan } = require('./utils/assert-timespan')
const { RandomStream } = require('./utils/random-stream')

test('should work with onSend-hook assigned as route config', async t => {
  t.plan(3)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    onSend: (request, reply, payload, done) => {
      t.ok(true)
      done(null, payload)
    },
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

test('should work with onSend-hook-Array assigned as route config', async t => {
  t.plan(3)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    onSend: [(request, reply, payload, done) => {
      t.ok(true)
      done(null, payload)
    }],
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
