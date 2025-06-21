import "@supabase/edge-runtime";
import * as Sentry from "@sentry";
import { Hono } from "@hono/hono";
import { HONO_CORS } from "@shared/cors.ts";
import { Routes } from "@shared/schema.ts";
import { RunModule } from "@modules/:moduleId/run.ts";
import { ScheduleModule } from "@modules/:moduleId/schedule.ts";

Sentry.init({
  dsn: Deno.env.get("SENTRY_DSN"),
  defaultIntegrations: false,
  tracesSampleRate: 1.0,
});
Sentry.setTag("region", Deno.env.get("SB_REGION"));
Sentry.setTag("execution_id", Deno.env.get("SB_EXECUTION_ID"));

const server = new Hono();

server.use("*", HONO_CORS);

server.post(Routes.RunModule, RunModule);
server.post(Routes.ScheduleModule, ScheduleModule);

Deno.serve((...args) => {
  try {
    return server.fetch(...args);
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/run-module' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
