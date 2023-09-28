'use strict'

const { createReadStream, statSync } = require('fs')
const rangeParse = require('range-parser')
const { resolve } = require('path')
const { fastifyThrottle } = require('../index')

async function main() {
  const fastify = require('fastify')()

  await fastify.register(fastifyThrottle, {
    bytesPerSecond: 100,
    streamPayloads: true,
    stringPayloads: true,
    bufferPayloads: true
  })

  const statOutputFile = statSync(resolve(__dirname, './output.file'))

  fastify.get('/file.bin', (req, reply) => {
    if (req.headers.range) {
      const range = rangeParse(statOutputFile.size, req.headers.range)[0]
      const options = {
        start: range.start,
        end: range.end,
      }
      reply.header('Content-Range', `bytes ${range.start}-${range.end}/${statOutputFile.size}`)
      reply.header('Content-Length', range.end - range.start + 1)
      reply.code(206) // Partial Content status code
      reply.send(createReadStream(resolve(__dirname, './output.file'), options))
    } else {
      reply.header('Accept-Ranges', 'bytes')
      reply.header('Content-Type', 'application/octet-stream')
      reply.header("Content-Disposition", 'attachment; filename="file.bin"')
      reply.header('Content-Length', statOutputFile.size)
      reply.send(createReadStream(resolve(__dirname, './output.file')))
    }
  })

  fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
      console.error(err)
    }
    console.log(address)
  })
}

(async () => await main())()
