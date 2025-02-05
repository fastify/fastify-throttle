'use strict'

const { test } = require('node:test')
const { isAsyncFunction } = require('../../lib/is-async-function.js')

test('isAsyncFunction returns true for async functions', (t) => {
  t.plan(1)
  t.assert.ok(isAsyncFunction(async () => { }))
})

test('isAsyncFunction returns false for non-async functions', (t) => {
  t.plan(1)
  t.assert.ok(!isAsyncFunction(() => { }))
})
