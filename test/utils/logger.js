'use strict'

/**
 * Custom logger implementation useful to check if the various logging
 * functions get called and check their content
 */
class CustomLogger {
  /**
   * @type {undefined | (...data: any[]) => void}
   */
  #infoFn

  /**
   * @type {undefined | (...data: any[]) => void}
   */
  #debugFn

  /**
   * @type {undefined | (...data: any[]) => void}
   */
  #fatalFn

  /**
   * @type {undefined | (...data: any[]) => void}
   */
  #warnFn

  /**
   * @type {undefined | (...data: any[]) => void}
   */
  #traceFn

  /**
   * @type {undefined | (...data: any[]) => CustomLogger}
  */
  #childFn

  /**
  * @type {undefined | (...data: any[]) => void}
  */
  #errFn

  /**
   * @param {object} param
   * @param {undefined | (...data: any[]) => void} param.info
   * @param {undefined | (...data: any[]) => void} param.debug
   * @param {undefined | (...data: any[]) => void} param.fatal
   * @param {undefined | (...data: any[]) => void} param.warn
   * @param {undefined | (...data: any[]) => void} param.info
   * @param {undefined | (...data: any[]) => void} param.trace
   * @param {undefined | (...data: any[]) => CustomLogger} param.child
   * @param {undefined | (...data: any[]) => void} param.error
ì   */
  constructor ({
    info,
    debug,
    fatal,
    warn,
    trace,
    child,
    error
  }) {
    this.#infoFn = info
    this.#debugFn = debug
    this.#fatalFn = fatal
    this.#warnFn = warn
    this.#traceFn = trace
    this.#childFn = child
    this.#errFn = error
  }

  info (...data) {
    if (this.#infoFn) {
      return this.#infoFn(...data)
    }
  }

  debug (...data) {
    if (this.#debugFn) {
      return this.#infoFn(...data)
    }
  }

  fatal (...data) {
    if (this.#fatalFn) {
      return this.#infoFn(...data)
    }
  }

  warn (...data) {
    if (this.#warnFn) {
      return this.#infoFn(...data)
    }
  }

  trace (...data) {
    if (this.#traceFn) {
      return this.#infoFn(...data)
    }
  }

  child (...data) {
    if (this.#childFn) {
      return this.#infoFn(...data)
    }

    return this
  }

  error (...data) {
    if (this.#errFn) {
      return this.#errFn(...data)
    }
  }
}

module.exports = {
  CustomLogger
}
