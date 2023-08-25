'use strict'

const { createReadStream } = require('fs')
const { resolve } = require('path')
const { fastifyThrottle } = require('../index')
const { RandomStream } = require('../test/utils/random-stream')

async function main () {
  const fastify = require('fastify')()

  await fastify.register(fastifyThrottle, {
    bytesPerSecond: 10000,
    streamPayloads: true,
    stringPayloads: true,
    bufferPayloads: true
  })

  fastify.get('/string', (req, reply) => {
    reply.send(Buffer.allocUnsafe(1024 * 1024).toString('ascii'))
  })

  fastify.get('/buffer', (req, reply) => {
    reply.send(Buffer.allocUnsafe(1024 * 1024))
  })

  fastify.get('/stream', (req, reply) => {
    reply.send(new RandomStream(30000))
  })

  fastify.get('/delayed', {
    config: {
      throttle: {
        bytesPerSecond: function (elapsedTime, bytes) {
          if (elapsedTime < 2) {
            return 0
          } else {
            return Infinity
          }
        }
      }
    }
  }, (req, reply) => {
    reply.send(createReadStream(resolve(__dirname, __filename)))
  })

  fastify.get('/pojo', (req, reply) => {
    const payload = Array(10000).fill(0).map(v => (Math.random() * 1e6).toString(36))
    reply.send({ payload })
  })

  fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
      console.error(err)
    }
    console.log(address)
  })
}

(async () => await main())()
