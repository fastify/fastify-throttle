'use strict'

const { test } = require('node:test')
const { ThrottleStream } = require('../../lib/throttle-stream')
const { RandomStream } = require('../utils/random-stream')
const { pipeline } = require('node:stream/promises')

test('_init is resilient against errors', async t => {
  t.plan(3)

  const bytesPerSecondFn = function () {
    throw new Error('ArbitraryError')
  }

  const randomStream = new RandomStream(10000)
  const throttleStream = new ThrottleStream({ bytesPerSecond: bytesPerSecondFn })

  await t.assert.rejects(
    pipeline(
      randomStream,
      throttleStream
    ), 'ArbitratyError'
  )

  t.assert.deepStrictEqual(throttleStream._buffer, null)
  t.assert.deepStrictEqual(throttleStream._interval, null)
})

test('intervalHandler is resilient against errors', async t => {
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

  t.assert.deepStrictEqual(throttleStream._buffer, null)
  t.assert.deepStrictEqual(throttleStream._interval, null)

  await t.assert.rejects(
    pipeline(
      randomStream,
      throttleStream
    ), 'ArbitratyError'
  )
})

test('_transform is resilient against errors', async t => {
  t.plan(3)

  const randomStream = new RandomStream(10000)
  const throttleStream = new ThrottleStream()

  throttleStream.push = function () {
    throw new Error('ArbitraryError')
  }

  t.assert.equal(throttleStream._buffer, null)
  t.assert.equal(throttleStream._interval, null)

  await t.assert.rejects(
    pipeline(
      randomStream,
      throttleStream
    ), 'ArbitratyError'
  )
})

test('should handle emitted errors properly', async t => {
  t.plan(5)

  const start = Date.now()

  const randomStream = new RandomStream(10000)
  const throttleStream = new ThrottleStream({ bytesPerSecond: 1000 })

  throttleStream.on('data', function () {
    t.assert.ok(Date.now() - start < 1500)
  })

  setTimeout(() => throttleStream.emit('error', new Error('ArbitraryError')), 1500)

  t.assert.deepStrictEqual(throttleStream._buffer, null)
  t.assert.deepStrictEqual(throttleStream._interval, null)

  await t.assert.rejects(
    pipeline(
      randomStream,
      throttleStream
    ), 'ArbitratyError'
  )
})
