'use strict'

/* c8 ignore next */
const AsyncFunctionConstructor = (async () => {}).constructor

/**
 * A function that returns true if the given function is an async function.
 */
const isAsyncFunction = (fn) => fn.constructor === AsyncFunctionConstructor

module.exports = {
  isAsyncFunction
}
