'use strict'

const { test } = require('tap')
const { assertTimespan } = require('../utils/assert-timespan')
const { ThrottleStream } = require('../../lib/throttle-stream')
const { RandomStream } = require('../utils/random-stream')
const { pipeline } = require('stream')

test('should take ~0 second to read 10,000 bytes at 10000bps', t => {
  t.plan(4)

  const randomStream = new RandomStream(10000)
  const throttleStream = ThrottleStream({ bytesPerSecond: 10000 })

  const startTime = Date.now()

  let bytes = 0
  throttleStream.on('data', function (data) {
    bytes += data.length
  })

  throttleStream.on('end', function () {
    assertTimespan(t, startTime, Date.now(), 50, 100)
    t.equal(10000, bytes)
    t.equal(bytes, throttleStream.bytes)
  })

  pipeline(
    randomStream,
    throttleStream,
    t.error
  )
})

test('should take ~1 second to read 20,000 bytes at 10000bps', t => {
  t.plan(4)

  const randomStream = new RandomStream(20000)
  const throttleStream = new ThrottleStream({ bytesPerSecond: 10000 })
  const startTime = Date.now()
  let bytes = 0
  throttleStream.on('data', function (data) {
    bytes += data.length
  })
  throttleStream.on('end', function () {
    assertTimespan(t, startTime, Date.now(), 1000)
    t.equal(20000, bytes)
    t.equal(bytes, throttleStream.bytes)
  })

  pipeline(
    randomStream,
    throttleStream,
    t.error
  )
})

test('should take ~3 seconds to read 4096 bytes at 1024bps', t => {
  t.plan(4)

  const randomStream = new RandomStream(4096)
  const throttleStream = new ThrottleStream({ bytesPerSecond: 1024 })

  const startTime = Date.now()
  let bytes = 0

  throttleStream.on('data', function (data) {
    bytes += data.length
  })

  throttleStream.on('end', function () {
    assertTimespan(t, startTime, Date.now(), 3000)
    t.equal(4096, bytes)
    t.equal(bytes, throttleStream.bytes)
  })

  pipeline(
    randomStream,
    throttleStream,
    t.error
  )
})
