'use strict'

const { test } = require('tap')
const { assertTimespan } = require('../utils/assert-timespan')
const { ThrottleStream } = require('../../lib/throttle-stream')
const { RandomStream } = require('../utils/random-stream')
const { SlowRandomStream } = require('../utils/slow-random-stream')
const { pipeline } = require('stream')

test('should work as expected with a slow readable', t => {
  t.plan(3)

  const slowRandomStream = new SlowRandomStream(10) // should take ~1 second
  const throttleStream = new ThrottleStream({ bytesPerSecond: 100 }) // ~10x faster than the slow stream

  const start = Date.now()

  let bytes = 0
  throttleStream.on('data', function (data) {
    bytes += data.length
  })

  throttleStream.on('end', function () {
    const end = Date.now()
    assertTimespan(t, start, end, 1000)
    t.equal(10, bytes)
  })

  pipeline(
    slowRandomStream,
    throttleStream,
    t.error
  )
})

test('should work as expected with a when input stream is providing bigger chunk than bytesPerSecond', t => {
  t.plan(3)

  const randomStream = new RandomStream(3000) // should take ~2 seconds
  const throttleStream = new ThrottleStream({ bytesPerSecond: 1000 }) // ~3x slower than the slow stream
  const start = Date.now()

  let bytes = 0
  throttleStream.on('data', function (data) {
    bytes += data.length
  })

  throttleStream.on('end', function () {
    assertTimespan(t, start, Date.now(), 2000)
    t.equal(3000, bytes)
  })

  pipeline(
    randomStream,
    throttleStream,
    t.error
  )
})
