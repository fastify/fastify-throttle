'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const { fastifyThrottle } = require('../index')
const { assertTimespan } = require('./utils/assert-timespan')
const { RandomStream } = require('./utils/random-stream')
const { ErrorStream } = require('./utils/error-stream')
const { CustomLogger } = require('./utils/logger')

test('stream (no error)', async t => {
  t.plan(1)
  const fastify = Fastify({
    loggerInstance: new CustomLogger((err) => {
      t.error(err)
    })
  })

  await fastify.register(fastifyThrottle, {
    bytesPerSecond: 1000
  })

  fastify.get('/throttled', (_req, reply) => { reply.send(new RandomStream(3000)) })

  const startTime = Date.now()

  await fastify.inject({
    url: '/throttled'
  })

  assertTimespan(t, startTime, Date.now(), 2000)
})

test('stream (error)', async t => {
  t.plan(4)
  const message = 'failed stream'
  const fastify = Fastify({
    loggerInstance: new CustomLogger({
      error: (data) => {
        // This function gets called twice
        // Once by fastify and once by the failed pipeline
        const err = data?.err ?? data

        t.type(err, Error)
        t.same(err.message, message)
      }
    })
  })

  await fastify.register(fastifyThrottle, {
    bytesPerSecond: 1000
  })

  fastify.get('/throttled', (_req, reply) => { reply.send(new ErrorStream(message)) })

  await fastify.inject({
    url: '/throttled'
  })
})
