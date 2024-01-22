'use strict'

const Readable = require('node:stream').Readable

/**
 * Readable stream implementation which trhows an Error with the specified message
 */
class ErrorStream extends Readable {
  /**
   * @type {string}
   */
  #message

  /**
   * @param {string} message
   */
  constructor (message) {
    super()
    this.#message = message
  }

  _read () {
    throw new Error(this.#message)
  }
}

module.exports = {
  ErrorStream
}
