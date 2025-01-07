'use strict'

const { test } = require('tap')
const { ThrottleStream } = require('../../lib/throttle-stream')
const { RandomStream } = require('../utils/random-stream')
const { pipeline } = require('node:stream')

test('_init is resilient against errors', t => {
  t.plan(3)

  const bytesPerSecondFn = function () {
    throw new Error('ArbitraryError')
  }

  const randomStream = new RandomStream(10000)
  const throttleStream = new ThrottleStream({ bytesPerSecond: bytesPerSecondFn })

  pipeline(
    randomStream,
    throttleStream,
    err => { t.equal(err.message, 'ArbitraryError') }
  )
  t.equal(throttleStream._buffer, null)
  t.equal(throttleStream._interval, null)
})

test('intervalHandler is resilient against errors', t => {
  t.plan(3)

  const bytesPerSecondFn = function (elapsedTime) {
    if (elapsedTime === 0) {
      return 1000
    } else {
      throw new Error('ArbitraryError')
    }
  }

  const randomStream = new RandomStream(10000)
  const throttleStream = new ThrottleStream({ bytesPerSecond: bytesPerSecondFn })

  pipeline(
    randomStream,
    throttleStream,
    err => {
      t.equal(err.message, 'ArbitraryError')
    }
  )
  t.equal(throttleStream._buffer, null)
  t.equal(throttleStream._interval, null)
})

test('_transform is resilient against errors', t => {
  t.plan(3)

  const randomStream = new RandomStream(10000)
  const throttleStream = new ThrottleStream()

  throttleStream.push = function () {
    throw new Error('ArbitraryError')
  }

  pipeline(
    randomStream,
    throttleStream,
    err => {
      t.equal(err.message, 'ArbitraryError')
    }
  )
  t.equal(throttleStream._buffer, null)
  t.equal(throttleStream._interval, null)
})

test('should handle emitted errors properly', t => {
  t.plan(5)

  const start = Date.now()

  const randomStream = new RandomStream(10000)
  const throttleStream = new ThrottleStream({ bytesPerSecond: 1000 })

  throttleStream.on('data', function () {
    t.ok(Date.now() - start < 1500)
  })

  setTimeout(() => throttleStream.emit('error', new Error('ArbitraryError')), 1500)
  pipeline(
    randomStream,
    throttleStream,
    err => { t.equal(err.message, 'ArbitraryError') }
  )
  t.equal(throttleStream._buffer, null)
  t.equal(throttleStream._interval, null)
})
