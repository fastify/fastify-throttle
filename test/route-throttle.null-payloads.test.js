'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const { fastifyThrottle } = require('../index')
const { assertTimespan } = require('./utils/assert-timespan')

test('should not error when sending null', async t => {
  t.plan(3)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    onSend: [(_request, _reply, _payload, done) => {
      t.assert.ok(true)
      done(null, null)
    }],
    config: {
      throttle: {
        bytesPerSecond: 1000
      }
    }
  }, (_req, reply) => { reply.send(null) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 50, 100)
  t.assert.deepStrictEqual(response.body.length, 0)
})
