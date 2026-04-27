import fastify, { FastifyRequest } from 'fastify'
import fastifyThrottle from '..'
import { expect } from 'tstyche'

const server = fastify()

server.register(fastifyThrottle, {
  bytesPerSecond: 1000,
  streamPayloads: true,
  bufferPayloads: false,
  stringPayloads: false
})
server.register(fastifyThrottle, {
  bytesPerSecond: (_req) => {
    expect(_req).type.toBeAssignableTo<FastifyRequest>()

    return (elapsedTime, bytes) => {
      expect(elapsedTime).type.toBe<number>()
      expect(bytes).type.toBe<number>()
      return 200
    }
  }
})

server.register(fastifyThrottle, {
  bytesPerSecond: async (_req) => {
    expect(_req).type.toBeAssignableTo<FastifyRequest>()

    return (elapsedTime, bytes) => {
      expect(elapsedTime).type.toBe<number>()
      expect(bytes).type.toBe<number>()
      return 200
    }
  }
})

server.register(fastifyThrottle, {
  async: true,
  bytesPerSecond: (_req) => {
    expect(_req).type.toBeAssignableTo<FastifyRequest>()

    return Promise.resolve((elapsedTime, bytes) => {
      expect(elapsedTime).type.toBe<number>()
      expect(bytes).type.toBe<number>()
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
}, () => { })
