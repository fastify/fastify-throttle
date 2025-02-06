'use strict'

const { test } = require('node:test')
const { assertTimespan } = require('../utils/assert-timespan')
const { ThrottleStream } = require('../../lib/throttle-stream')
const { RandomStream } = require('../utils/random-stream')
const { SlowRandomStream } = require('../utils/slow-random-stream')
const { withResolvers } = require('../utils/promise')
const { pipeline } = require('node:stream')

test('should work as expected with a slow readable', async t => {
  t.plan(3)

  const slowRandomStream = new SlowRandomStream(10) // should take ~1 second
  const throttleStream = new ThrottleStream({ bytesPerSecond: 100 }) // ~10x faster than the slow stream

  const startTime = Date.now()

  let bytes = 0
  throttleStream.on('data', function (data) {
    bytes += data.length
  })

  const { resolve, promise } = withResolvers()

  throttleStream.on('end', function () {
    assertTimespan(t, startTime, Date.now(), 1000)
    t.assert.deepStrictEqual(10, bytes)
    resolve()
  })

  pipeline(
    slowRandomStream,
    throttleStream,
    t.assert.ifError
  )

  await promise
})

test('should work as expected with a when input stream is providing bigger chunk than bytesPerSecond', t => {
  t.plan(3)

  const randomStream = new RandomStream(3000) // should take ~2 seconds
  const throttleStream = new ThrottleStream({ bytesPerSecond: 1000 }) // ~3x slower than the slow stream
  const startTime = Date.now()

  let bytes = 0
  throttleStream.on('data', function (data) {
    bytes += data.length
  })

  const { resolve, promise } = withResolvers()

  throttleStream.on('end', function () {
    assertTimespan(t, startTime, Date.now(), 2000)
    t.assert.deepStrictEqual(3000, bytes)
    resolve()
  })

  pipeline(
    randomStream,
    throttleStream,
    t.assert.ifError
  )

  return promise
})
