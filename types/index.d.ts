/// <reference types='node' />

import {
  FastifyPluginCallback,
} from 'fastify';

declare module 'fastify' {
  interface FastifyContextConfig {
    throttle?: fastifyThrottle.FastifyThrottleOptions;
  }
}

type FastifyThrottle = FastifyPluginCallback<fastifyThrottle.FastifyThrottleOptions>;

declare namespace fastifyThrottle {

  export interface FastifyThrottleOptions {
    bytesPerSecond: number | ((elapsedTime: number, bytes: number) => number)
    /**
     * Throttle stream payloads
     * @default true
     */
    streamPayloads?: boolean

    /**
     * Throttle buffer payloads
     * @default false
     */
    bufferPayloads?: boolean

    /**
     * Throttle string payloads
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
