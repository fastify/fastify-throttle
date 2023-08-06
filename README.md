# @fastify/throttle

![CI](https://github.com/fastify/fastify-throttle/workflows/CI/badge.svg)
[![NPM version](https://img.shields.io/npm/v/@fastify/throttle.svg?style=flat)](https://www.npmjs.com/package/@fastify/throttle)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

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
await fastify.register(import('@fastify/throttle'), {#
  bps: 1024 * 1024 // 1MB/s
  streamPayloads: true // throttle the payload if it is a stream
  streamBuffers: true // throttle the payload if it is a Buffer
  streamStrings: true // throttle the payload if it is a string
})

fastify.get('/', (request, reply) => {
  reply.send({ hello: 'world' })
})

fastify.listen({ port: 3000 }, err => {
  if (err) throw err
  console.log('Server listening at http://localhost:3000')
})
```

### Options

You can pass the following options during the plugin registration:
```js
await fastify.register(import('@fastify/throttle'), {
  bps: 1000, // 1000 bytes per second
  streamPayloads: true // throttle the payload if it is a stream
  streamBuffers: true // throttle the payload if it is a Buffer
  streamStrings: true // throttle the payload if it is a string
})
```

You can define the throttling globally as plugin options or per route options.
The throttle options per route are the same as the plugin options.

| Header | Description |
|--------|-------------|
|`bps`     | The allowed bytes per second, number or a function |
|`streamPayloads` | Throttle the payload if it is a stream |
|`streamBuffers` | Throttle the payload if it is a Buffer |
|`streamStrings` | Throttle the payload if it is a string |

Example for setting throttling globally.

```js
  'use strict'

  const fastify = require('fastify')()

  await fastify.register(require('../index'), {
    bps: 1024 // 1KB/s
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

  await fastify.register(require('../index'))

  fastify.get('/', {
    config: {
      throttle: {
        bps: 1000
      }
    }
  }, (req, reply) => {
    reply.send(createReadStream(resolve(__dirname, __filename)))
  })

  fastify.listen({ port: 3000 })
```

The `bps` option can be a number or a function. The function for `bps` has the following typescript definition: 

```typescript
(elapsedTime: number, bytes: number) => number
```

`elapsedTime` is the time since the streaming started in seconds.
`bytes` are the bytes already sent.

You must ensure, that the return value is an integer or `Infinity`.

You could for example delay the output by sending 0 the first 2 seconds by defining
the `bps` like this:

```js
  'use strict'

  const fastify = require('fastify')()

  await fastify.register(require('../index'))

  fastify.get('/', {
    config: {
      throttle: {
        bps: function (elapsedTime, bytes) {
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

  fastify.listen({ port: 3000 })
```

<a name="license"></a>
## License
**[MIT](https://github.com/fastify/fastify-throttle/blob/master/LICENSE)**
