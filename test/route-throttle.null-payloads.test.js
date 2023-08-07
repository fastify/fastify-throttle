'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const { fastifyThrottle } = require('../index')
const { assertTimespan } = require('./utils/assert-timespan')

test('should not error when sending null', async t => {
  t.plan(3)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    onSend: [(request, reply, payload, done) => {
      t.ok(true)
      done(null, null)
    }],
    config: {
      throttle: {
        bytesPerSecond: 1000
      }
    }
  }, (req, reply) => { reply.send(null) })

  const startTime = Date.now()

  const response = await fastify.inject('/throttled')
  assertTimespan(t, startTime, Date.now(), 20, 100)
  t.equal(response.body.length, 0)
})
