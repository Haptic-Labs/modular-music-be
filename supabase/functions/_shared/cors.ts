import { cors } from '@hono/cors';

export const HONO_CORS = cors({
  origin: '*',
  allowHeaders: ['authorization', 'x-client-info', 'apikey', 'content-type'],
});
