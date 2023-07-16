import fastify from 'fastify'
import fastifyThrottle from '..'
import { expectType } from 'tsd';

const server = fastify()

server.register(fastifyThrottle, {
  bps: 1000,
  streamPayloads: true,
  bufferPayloads: false,
  stringPayloads: false
})
server.register(fastifyThrottle, {
  bps: (elapsedTime, bytes) => {
    expectType<number>(elapsedTime)
    expectType<number>(bytes)
    return 200
  }
})

server.get('/', {
  config: {
    throttle: {
      bps: 1000,
      streamPayloads: true,
      bufferPayloads: false,
      stringPayloads: false
    }
  }
}, (request, reply) => { })
