'use strict'

/**
 * @param {*} t
 * @param {number} start
 * @param {number} end
 * @param {number} expected
 * @param {number} [tolerance=10]
 */
function assertTimespan (t, start, end, expected, tolerance = 10) {
  const diff = end - start
  const delta = Math.abs(expected - diff)
  t.ok(delta <= (expected / 100 * tolerance), 'tolerance of ' + tolerance + '%, got ' + delta + 'ms')
}

module.exports = {
  assertTimespan
}
