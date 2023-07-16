'use strict'

/**
 * Returns a function that always returns the given bps.
 * @param {number} bps
 * @returns
 */
function bpsToBpsFn (bps) {
  return function bpsFn (elapsedTime, bytes) {
    return bps
  }
}

module.exports = {
  bpsToBpsFn
}
