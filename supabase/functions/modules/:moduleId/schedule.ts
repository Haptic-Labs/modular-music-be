import { HonoFn } from "@shared/types.ts";
import { validateAuth } from "@shared/validate-auth.ts";
import { setupSupabase } from "@shared/setup-supabase.ts";
import { HTTPException } from "@hono/http-exception";
import { Schema } from "@shared/schema.ts";
import { calculateNextCronJob } from "@shared/calculate-next-cron-job.ts";

export const ScheduleModule: HonoFn<"ScheduleModule"> = async (ctx) => {
  const { authHeader } = validateAuth(ctx);
  const { supabaseClient } = setupSupabase({ authHeader });

  const moduleId = ctx.req.param("moduleId");

  if (!moduleId) {
    throw new HTTPException(400, {
      message: "Missing required field: 'moduleId'",
    });
  }

  let { next_run, schedule_config, reschedule } =
    (await ctx.req.json<Schema["ScheduleModule"]["request"]>()) ?? {};
  if (!reschedule && (!next_run || !schedule_config)) {
    const { error } = await supabaseClient
      .schema("public")
      .rpc("DeleteModuleCronJob", {
        moduleId,
      });
    const { error: error2 } = await supabaseClient
      .schema("public")
      .from("modules")
      .update({
        next_run: null,
        schedule_config: null,
      })
      .eq("id", moduleId);

    if (error || error2) {
      throw new HTTPException(400, {
        message: `Error deleting module cron job\n${JSON.stringify(error?.message ?? error2?.message, null, 2)}`,
      });
    }
    return ctx.body(null, 204);
  }

  if (
    reschedule &&
    authHeader.replace("Bearer ", "") !==
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  ) {
    throw new HTTPException(403, {
      message:
        "Unauthorized: You do not have permission to reschedule modules.",
    });
  }

  if (reschedule && (!next_run || !schedule_config)) {
    const currentModule = await supabaseClient
      .schema("public")
      .from("modules")
      .select("next_run, schedule_config")
      .eq("id", moduleId)
      .maybeSingle();
    if (
      currentModule.error ||
      !currentModule.data ||
      !currentModule.data.next_run ||
      !currentModule.data.schedule_config
    ) {
      throw new HTTPException(400, {
        message: `Error fetching current module schedule for moduleId: ${moduleId}`,
      });
    }

    next_run = currentModule.data.next_run;
    schedule_config = currentModule.data.schedule_config;
  } else if (!reschedule) {
    throw new HTTPException(400, {
      message: `Error: 'reschedule' is false but 'next_run' or 'schedule_config' is missing`,
    });
  }

  if (!next_run || !schedule_config) {
    throw new HTTPException(500, {
      message: `Error: 'next_run' or 'schedule_config' is missing for moduleId: ${moduleId}`,
    });
  }

  const { cronString, nextRun } =
    calculateNextCronJob({
      next_run,
      schedule_config,
    }) ?? {};
  if (!cronString || !nextRun) {
    throw new HTTPException(400, {
      message:
        "Error calculating cron string from next_run and schedule_config",
    });
  }

  const { data: moduleSchedule } = await supabaseClient
    .schema("public")
    .from("modules")
    .update({
      next_run: nextRun,
      schedule_config,
    })
    .eq("id", moduleId)
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
