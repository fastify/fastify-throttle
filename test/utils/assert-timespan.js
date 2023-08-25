'use strict'

/**
 * @param {*} t
 * @param {number} start
 * @param {number} end
 * @param {number} expected
 * @param {number} [tolerance=15]
 */
function assertTimespan (t, start, end, expected, tolerance = 15) {
  const delta = end - start
  t.ok(delta <= (expected + Math.floor(expected / 100 * tolerance)), `tolerance of ${tolerance}% of ${expected} ms, expected ${expected}ms ± ${Math.floor(expected / 100 * tolerance)}ms got ${delta} ms`)
}

module.exports = {
  assertTimespan
}
