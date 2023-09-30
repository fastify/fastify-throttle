'use strict'

const { test } = require('tap')
const { isAsyncFunction } = require('../../lib/is-async-function.js')

test('isAsyncFunction returns true for async functions', (t) => {
  t.plan(1)
  t.ok(isAsyncFunction(async () => { }))
})

test('isAsyncFunction returns false for non-async functions', (t) => {
  t.plan(1)
  t.notOk(isAsyncFunction(() => { }))
})
