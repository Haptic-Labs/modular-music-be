import { HonoFn } from "../../_shared/types.ts";
import {
  setupSupabaseWithUser,
  setupSupabaseWithServiceRole,
} from "../../_shared/setup-supabase.ts";
import { validateAuth } from "../../_shared/validate-auth.ts";
import { HTTPException } from "@hono/hono/http-exception";

type StatusCode = ConstructorParameters<typeof HTTPException>[0];

export const RunModule: HonoFn<"RunModule"> = async (ctx) => {
  const { authHeader } = validateAuth(ctx);
  const { user } = await setupSupabaseWithUser({ authHeader });
  const { serviceRoleSupabaseClient } = setupSupabaseWithServiceRole();
  const moduleId = ctx.req.param("moduleId");

  if (!moduleId) {
    throw new HTTPException(400, {
      message: "Missing required field: 'moduleId'",
    });
  }

  const { data, error } = await serviceRoleSupabaseClient
    .schema("public")
    .rpc("GetModuleRunData", { moduleId, callerUserId: user.id });

  if (error) {
    const errorCode = parseInt(error.code, 10);

    // Validate the errorCode to ensure it's a valid HTTP status code
    const httpStatus = errorCode >= 100 && errorCode < 600 ? errorCode : 500;

    throw new HTTPException(httpStatus as StatusCode, {
      message: error.message,
    });
  }

  // TODO: run module
};
