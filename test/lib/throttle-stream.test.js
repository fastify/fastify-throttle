'use strict'

const { test } = require('tap')
const { assertTimespan } = require('../utils/assert-timespan')
const { ThrottleStream } = require('../../lib/throttle-stream')
const { RandomStream } = require('../utils/random-stream')
const { SlowRandomStream } = require('../utils/slow-random-stream')

test('should delay the stream for 2 seconds', t => {
  t.plan(7)
  const r = new RandomStream(16384 * 2) // should take ~2 seconds
  const throttle = new ThrottleStream({
    bps: function (elapsedTime, bytes) {
      if (elapsedTime < 2) {
        return 0
      } else {
        return Infinity
      }
    }
  })
  const start = Date.now()
  let bytes = 0
  throttle.on('data', function (data) {
    t.ok(Date.now() - start > 2000)
    bytes += data.length
  })
  throttle.on('end', function () {
    assertTimespan(t, start, Date.now(), 2000)
    t.equal(16384 * 2, bytes)
  })
  r.pipe(throttle)

  t.equal(throttle.bpsFn(0, 0), 0)
  t.equal(throttle.bpsFn(1.999, 0), 0)
  t.equal(throttle.bpsFn(2, 0), Infinity)
})
test('should take ~0 second to read 10,000 bytes at 10000bps', t => {
  t.plan(2)
  const r = new RandomStream(10000)
  const throttle = ThrottleStream({ bps: 10000 })
  const start = Date.now()
  let bytes = 0
  throttle.on('data', function (data) {
    bytes += data.length
  })
  throttle.on('end', function () {
    const end = Date.now()
    assertTimespan(t, start, end, 10, 100)
    t.equal(10000, bytes)
  })
  r.pipe(throttle)
})

test('should take ~1 second to read 20,000 bytes at 10000bps', t => {
  t.plan(2)
  const r = new RandomStream(20000)
  const throttle = new ThrottleStream({ bps: 10000 })
  const start = Date.now()
  let bytes = 0
  throttle.on('data', function (data) {
    bytes += data.length
  })
  throttle.on('end', function () {
    const end = Date.now()
    assertTimespan(t, start, end, 1000)
    t.equal(20000, bytes)
  })
  r.pipe(throttle)
})

test('should take ~0 seconds to read 1,024 bytes at 1024bps', t => {
  t.plan(2)
  const r = new RandomStream(1024)
  const throttle = new ThrottleStream({ bps: 1024 })
  const start = Date.now()
  let bytes = 0
  throttle.on('data', function (data) {
    bytes += data.length
  })
  throttle.on('end', function () {
    const end = Date.now()
    assertTimespan(t, start, end, 10, 100)
    t.equal(1024, bytes)
  })
  r.pipe(throttle)
})
test('should take ~3 seconds to read 4096 bytes at 1024bps', t => {
  t.plan(2)
  const r = new RandomStream(4096)
  const throttle = new ThrottleStream({ bps: 1024 })
  const start = Date.now()
  let bytes = 0
  throttle.on('data', function (data) {
    bytes += data.length
  })
  throttle.on('end', function () {
    const end = Date.now()
    assertTimespan(t, start, end, 3000)
    t.equal(4096, bytes)
  })
  r.pipe(throttle)
})

test('should work as expected with a slow readable', t => {
  t.plan(2)
  const r = new SlowRandomStream(10) // should take ~1 second
  const throttle = new ThrottleStream({ bps: 100 }) // ~10x faster than the slow stream
  const start = Date.now()
  let bytes = 0
  throttle.on('data', function (data) {
    bytes += data.length
  })
  throttle.on('end', function () {
    const end = Date.now()
    assertTimespan(t, start, end, 1000)
    t.equal(10, bytes)
  })
  r.pipe(throttle)
})

test('should work as expected with a when input stream is providing bigger chunk than bps', t => {
  t.plan(2)
  const r = new RandomStream(3000) // should take ~2 seconds
  const throttle = new ThrottleStream({ bps: 1000 }) // ~3x slower than the slow stream
  const start = Date.now()
  let bytes = 0
  throttle.on('data', function (data) {
    bytes += data.length
  })
  throttle.on('end', function () {
    assertTimespan(t, start, Date.now(), 2000)
    t.equal(3000, bytes)
  })
  r.pipe(throttle)
})

test('should use by default 16384 as return value of bpsFn', t => {
  t.plan(3)
  const r = new RandomStream(16384 * 2) // should take ~2 seconds
  const throttle = new ThrottleStream()
  const start = Date.now()
  let bytes = 0
  throttle.on('data', function (data) {
    bytes += data.length
  })
  throttle.on('end', function () {
    assertTimespan(t, start, Date.now(), 1000)
    t.equal(16384 * 2, bytes)
  })
  r.pipe(throttle)

  t.equal(throttle.bpsFn(0, 0), 16384)
})
