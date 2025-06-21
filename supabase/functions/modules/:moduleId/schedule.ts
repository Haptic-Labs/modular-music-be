import { HonoFn } from "@shared/types.ts";
import { validateAuth } from "@shared/validate-auth.ts";
import { setupSupabaseWithUser } from "@shared/setup-supabase.ts";
import { HTTPException } from "@hono/http-exception";
import { Schema } from "@shared/schema.ts";
import { calculateNextCronJob } from "@shared/calculate-next-cron-job.ts";

export const ScheduleModule: HonoFn<"ScheduleModule"> = async (ctx) => {
  const { authHeader } = validateAuth(ctx);
  const { supabaseClient, user } = await setupSupabaseWithUser({ authHeader });

  const moduleId = ctx.req.param("moduleId");

  if (!moduleId) {
    throw new HTTPException(400, {
      message: "Missing required field: 'moduleId'",
    });
  }

  const { next_run, schedule_config } =
    (await ctx.req.json<Schema["ScheduleModule"]["request"]>()) ?? {};
  if (!next_run || !schedule_config) {
    const { error } = await supabaseClient
      .schema("public")
      .rpc("DeleteModuleCronJob", {
        moduleId,
      });
    if (error) {
      throw new HTTPException(400, {
        message: `Error deleting module cron job\n${JSON.stringify(error.message, null, 2)}`,
      });
    }
    return ctx.json({}, 204);
  }

  const cronString = calculateNextCronJob({
    next_run,
    schedule_config,
  });
  if (!cronString) {
    throw new HTTPException(400, {
      message:
        "Error calculating cron string from next_run and schedule_config",
    });
  }

  const { data: moduleSchedule } = await supabaseClient
    .schema("public")
    .from("modules")
    .update({
      next_run,
      schedule_config,
    })
    .eq("id", moduleId)
    .eq("user_id", user.id)
    .select("next_run, schedule_config")
    .single();

  if (!moduleSchedule) {
    throw new HTTPException(500, {
      message: `Error updating module schedule for moduleId: ${moduleId}`,
    });
  }

  const { error } = await supabaseClient
    .schema("public")
    .rpc("ScheduleModuleCronJob", {
      moduleId,
      cronString,
    });
  if (error) {
    throw new HTTPException(500, {
      message: `Error scheduling module cron job:\n${JSON.stringify(error.message, null, 2)}`,
    });
  }

  return ctx.json(moduleSchedule, 200);
};
