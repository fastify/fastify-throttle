import {
  FastifyPluginCallback,
} from 'fastify';

declare module 'fastify' {
  interface FastifyContextConfig {
    throttle?: fastifyThrottle.FastifyThrottleOptions;
  }
}

type FastifyThrottle = FastifyPluginCallback<fastifyThrottle.FastifyThrottleOptions>;

/**
 * Represents a function that calculates the rate of bytes per second.
 * @callback BytesPerSecondFn
 * @param {number} elapsedTime - The elapsed time in seconds.
 * @param {number} bytes - The number of bytes processed during the elapsed time.
 * @returns {number} The rate of bytes per second as a number.
 */
type BytesPerSecondFn = (elapsedTime: number, bytes: number) => number

/**
 * Namespace for fastify-throttle plugin options.
 *
 * @namespace fastifyThrottle
 */
declare namespace fastifyThrottle {

  /**
   * Options for configuring the fastify-throttle plugin.
   *
   * @interface FastifyThrottleOptions
   */
  export interface FastifyThrottleOptions {
    /**
     * Number or a function that returns bytes per second to throttle to.
     * @type {number|BytesPerSecondFn}
     * @default 16384
     */
    bytesPerSecond: number | BytesPerSecondFn

    /**
     * Throttle stream payloads.
     * @type {boolean}
     * @default true
     */
    streamPayloads?: boolean

    /**
     * Throttle buffer payloads.
     * @type {boolean}
     * @default false
     */
    bufferPayloads?: boolean

    /**
     * Throttle string payloads.
     * @type {boolean}
     * @default false
     */
    stringPayloads?: boolean
  }

  export interface FastifyThrottlePluginOptions extends FastifyThrottleOptions {
  }
  export const fastifyThrottle: FastifyThrottle
  export { fastifyThrottle as default }
}

declare function fastifyThrottle(...params: Parameters<FastifyThrottle>): ReturnType<FastifyThrottle>
export = fastifyThrottle
