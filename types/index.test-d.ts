import fastify, { FastifyRequest } from 'fastify'
import fastifyThrottle from '..'
import { expectType } from 'tsd'

const server = fastify()

server.register(fastifyThrottle, {
  bytesPerSecond: 1000,
  streamPayloads: true,
  bufferPayloads: false,
  stringPayloads: false
})
server.register(fastifyThrottle, {
  bytesPerSecond: (_req) => {
    expectType<FastifyRequest>(_req)
    return (elapsedTime, bytes) => {
      expectType<number>(elapsedTime)
      expectType<number>(bytes)
      return 200
    }
  }
})

server.register(fastifyThrottle, {
  bytesPerSecond: async (_req) => {
    expectType<FastifyRequest>(_req)
    return (elapsedTime, bytes) => {
      expectType<number>(elapsedTime)
      expectType<number>(bytes)
      return 200
    }
  }
})

server.register(fastifyThrottle, {
  async: true,
  bytesPerSecond: (_req) => {
    expectType<FastifyRequest>(_req)
    return Promise.resolve((elapsedTime, bytes) => {
      expectType<number>(elapsedTime)
      expectType<number>(bytes)
      return 200
    })
  }
})

server.get('/', {
  config: {
    throttle: {
      bytesPerSecond: 1000,
      streamPayloads: true,
      bufferPayloads: false,
      stringPayloads: false
    }
  }
}, (request, reply) => { })
