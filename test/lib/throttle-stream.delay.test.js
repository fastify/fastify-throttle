'use strict'

const { test } = require('tap')
const { assertTimespan } = require('../utils/assert-timespan')
const { ThrottleStream } = require('../../lib/throttle-stream')
const { RandomStream } = require('../utils/random-stream')
const { pipeline } = require('stream')

test('should delay the stream for 2 seconds', t => {
  t.plan(8)

  const randomStream = new RandomStream(16384 * 2) // should take ~2 seconds
  const throttleStream = new ThrottleStream({
    bytesPerSecond: function (elapsedTime, bytes) {
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
    t.ok(Date.now() - startTime > 2000)
    bytes += data.length
  })
  throttleStream.on('end', function () {
    assertTimespan(t, startTime, Date.now(), 2000)
    t.equal(16384 * 2, bytes)
  })

  pipeline(
    randomStream,
    throttleStream,
    t.error
  )

  t.equal(throttleStream.bytesPerSecondFn(0, 0), 0)
  t.equal(throttleStream.bytesPerSecondFn(1.999, 0), 0)
  t.equal(throttleStream.bytesPerSecondFn(2, 0), Infinity)
})
