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
    bps: number | ((elapsedTime: number, bytes: number) => number)
  }

  export interface FastifyThrottlePluginOptions extends FastifyThrottleOptions {
  }
  export const fastifyThrottle: FastifyThrottle
  export { fastifyThrottle as default }
}

declare function fastifyThrottle(...params: Parameters<FastifyThrottle>): ReturnType<FastifyThrottle>
export = fastifyThrottle
