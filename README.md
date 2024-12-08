# @fastify/throttle

[![CI](https://github.com/fastify/fastify-throttle/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/fastify/fastify-throttle/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/@fastify/throttle.svg?style=flat)](https://www.npmjs.com/package/@fastify/throttle)
[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-brightgreen?style=flat)](https://github.com/neostandard/neostandard)

Throttle the download speed of a request.

## Install
```sh
npm i @fastify/throttle
```

## Usage
Register the plugin and, if necessary, pass custom options.

This plugin will add an `onSend` hook to the Fastify instance, which will throttle the download speed of the response.
```js
import Fastify from 'fastify'

const fastify = Fastify()
await fastify.register(import('@fastify/throttle'), {
  bytesPerSecond: 1024 * 1024, // 1MB/s
  streamPayloads: true, // throttle the payload if it is a stream
  bufferPayloads: true, // throttle the payload if it is a Buffer
  stringPayloads: true // throttle the payload if it is a string
})

fastify.get('/', (request, reply) => {
  reply.send({ hello: 'world' })
})

fastify.listen({ port: 3000 }, err => {
  if (err) {
    throw err
  }
  console.log('Server listening at http://localhost:3000')
})
```

### Options

You can pass the following options during the plugin registration:
```js
await fastify.register(import('@fastify/throttle'), {
  bytesPerSecond: 1000, // 1000 bytes per second
  streamPayloads: true, // throttle the payload if it is a stream
  bufferPayloads: true, // throttle the payload if it is a Buffer
  stringPayloads: true // throttle the payload if it is a string
})
```

You can define the throttling globally as plugin options or per route options.
The throttle options per route are the same as the plugin options.

| Header | Description | Default |
|--------|-------------|---------|
| `bytesPerSecond` | The allowed bytes per second, number or a function | 16384 |
| `streamPayloads` | Throttle the payload if it is a stream | true |
| `bufferPayloads` | Throttle the payload if it is a Buffer | false |
| `stringPayloads` | Throttle the payload if it is a string | false |
| `async` | Set to true if bytesPerSecond is a function returning a Promise | false |

Example for setting throttling globally:

```js
  const fastify = require('fastify')()

  await fastify.register(import('@fastify/throttle'), {
    bytesPerSecond: 1024 // 1KB/s
  })

  fastify.get('/', (req, reply) => {
    reply.send(createReadStream(resolve(__dirname, __filename)))
  })

  fastify.listen({ port: 3000 })
```

Example for setting the throttling per route:

```js
  'use strict'

  const fastify = require('fastify')()

  await fastify.register(import('@fastify/throttle'))

  fastify.get('/', {
    config: {
      throttle: {
        bytesPerSecond: 1000
      }
    }
  }, (req, reply) => {
    reply.send(createReadStream(resolve(__dirname, __filename)))
  })

  fastify.listen({ port: 3000 })
```

The `bytesPerSecond` option can be a number or a function. The function for `bytesPerSecond` has the following TypeScript definition:

```typescript
type BytesPerSecond = (request: FastifyRequest) => ((elapsedTime: number, bytes: number) => number) | Promise<((elapsedTime: number, bytes: number) => number)>
```

`request` is the Fastify request object.

`elapsedTime` is the time since the streaming started in seconds.
`bytes` are the bytes already sent.

You must ensure that the return value is an integer or `Infinity`.

You could, for example, delay the output by sending 0 for the first 2 seconds by defining
the `bytesPerSecond` like this:

```js
  const fastify = require('fastify')()

  await fastify.register(import('@fastify/throttle'))

  fastify.get('/', {
    config: {
      throttle: {
        bytesPerSecond: function bytesPerSecondfactory(request) {
          // this function runs for every request
          const client = request.headers['customer-id']

          return function (elapsedTime, bytes) {
            return CONFIG[client] * 2 // return a number of xyz
          }
        }
      }
    }
  }, (req, reply) => {
    reply.send(createReadStream(resolve(__dirname, __filename)))
  })

  fastify.listen({ port: 3000 })
```

The `bytesPerSecond` function can be a sync function or an async function. If you provide an async function then it will be detected by the plugin. If it is a sync function returning a Promise, you must set the `async` option to `true`, so that the plugin knows that it should await the Promise.

```js
  const fastify = require('fastify')()

  await fastify.register(import('@fastify/throttle'))

  fastify.get('/', {
    config: {
      throttle: {
        async: true,
        bytesPerSecond: function bytesPerSecondfactory(request) {
          // this function runs for every request
          const client = request.headers['customer-id']

          return Promise.resolve(function (elapsedTime, bytes) {
            return CONFIG[client] * 2 // return a number of xyz
          })
        }
      }
    }
  }, (req, reply) => {
    reply.send(createReadStream(resolve(__dirname, __filename)))
  })

  fastify.listen({ port: 3000 })
```

<a name="license"></a>
## License
**[MIT](https://github.com/fastify/fastify-throttle/blob/master/LICENSE)**
