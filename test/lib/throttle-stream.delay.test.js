'use strict'

const { test } = require('node:test')
const { assertTimespan } = require('../utils/assert-timespan')
const { ThrottleStream } = require('../../lib/throttle-stream')
const { RandomStream } = require('../utils/random-stream')
const { pipeline } = require('node:stream')

// TODO: Flaky test, remove skip
test('should delay the stream for 2 seconds', { skip: true }, t => {
  t.plan(8)

  const randomStream = new RandomStream(16384 * 2) // should take ~2 seconds
  const throttleStream = new ThrottleStream({
    bytesPerSecond: function (elapsedTime) {
      if (elapsedTime < 2) {
        return 0
      } else {
        return Infinity
      }
    }
  })
  const startTime = Date.now()
  let bytes = 0
  throttleStream.on('data', function (data) {
    t.assert.ok(Date.now() - startTime > 2000)
    bytes += data.length
  })
  throttleStream.on('end', function () {
    assertTimespan(t, startTime, Date.now(), 2000)
    t.assert.deepStrictEqual(16384 * 2, bytes)
  })

  pipeline(
    randomStream,
    throttleStream,
    t.error
  )

  t.assert.deepStrictEqual(throttleStream.bytesPerSecondFn(0, 0), 0)
  t.assert.deepStrictEqual(throttleStream.bytesPerSecondFn(1.999, 0), 0)
  t.assert.deepStrictEqual(throttleStream.bytesPerSecondFn(2, 0), Infinity)
})
