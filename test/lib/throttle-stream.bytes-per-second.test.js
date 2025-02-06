'use strict'

const { test } = require('node:test')
const { ThrottleStream } = require('../../lib/throttle-stream')

test('should use by default 16384 as return value of bytesPerSecondFn', t => {
  t.plan(5)
  const throttleStream = new ThrottleStream()

  t.assert.deepStrictEqual(throttleStream.bytesPerSecondFn(0, 0), 16384)
  t.assert.deepStrictEqual(throttleStream.bytesPerSecondFn(1, 1024), 16384)
  t.assert.deepStrictEqual(throttleStream.bytesPerSecondFn(2, 1024), 16384)
  t.assert.deepStrictEqual(throttleStream.bytesPerSecondFn(3, 1024), 16384)
  t.assert.deepStrictEqual(throttleStream.bytesPerSecondFn(4, 1024), 16384)
})
