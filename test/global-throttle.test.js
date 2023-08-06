'use strict'

const t = require('tap')
const test = t.test
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

  fastify.get('/throttled', (req, reply) => { reply.send(new RandomStream(3000)) })

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

  fastify.get('/throttled', (req, reply) => { reply.send(new RandomStream(30000)) })

  const startTime = Date.now()

  await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
})
