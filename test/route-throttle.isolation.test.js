'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const { fastifyThrottle } = require('../index')
const { assertTimespan } = require('./utils/assert-timespan')
const { RandomStream } = require('./utils/random-stream')

test('should throttle per route but not effect other routes', async t => {
  t.plan(1)
  const fastify = Fastify()

  await fastify.register(fastifyThrottle)

  fastify.get('/throttled', {
    config: {
      throttle: {
        bytesPerSecond: 1000
      }
    }
  }, (req, reply) => { reply.send(new RandomStream(3000)) })

  fastify.get('/unthrottled', (req, reply) => { reply.send(new RandomStream(3000)) })

  const startTime = Date.now()

  await fastify.inject('/unthrottled')
  assertTimespan(t, startTime, Date.now(), 20, 100)
})
