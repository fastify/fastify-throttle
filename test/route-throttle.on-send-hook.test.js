'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const { fastifyThrottle } = require('../index')
const { assertTimespan } = require('./utils/assert-timespan')
const { RandomStream } = require('./utils/random-stream')

test('should work with onSend-hook assigned as route config', async t => {
  t.plan(3)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    onSend: (_request, _reply, payload, done) => {
      t.assert.ok(true)
      done(null, payload)
    },
    config: {
      throttle: {
        bytesPerSecond: 1000
      }
    }
  }, (_req, reply) => { reply.send(new RandomStream(3000)) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
  t.assert.deepStrictEqual(response.body.length, 3000)
})

test('should work with onSend-hook-Array assigned as route config', async t => {
  t.plan(3)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    onSend: [(_request, _reply, payload, done) => {
      t.assert.ok(true)
      done(null, payload)
    }],
    config: {
      throttle: {
        bytesPerSecond: 1000
      }
    }
  }, (_req, reply) => { reply.send(new RandomStream(3000)) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 2000)
  t.assert.deepStrictEqual(response.body.length, 3000)
})
