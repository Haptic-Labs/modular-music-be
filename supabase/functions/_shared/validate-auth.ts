import { Context } from '@hono/hono';
import { HTTPException } from '@hono/http-exception';

export const validateAuth = (ctx: Context) => {
  const authHeader = ctx.req.header('Authorization');
  if (!authHeader) {
    const message = "Missing 'Authorization' header";
    console.error(message);
    throw new HTTPException(401, { message });
  }

  return { authHeader };
};
