import { BlankEnv, H, HandlerResponse } from "@hono/types";
import { Schema } from "../_shared/schema.ts";

export type HonoFn<R extends keyof Schema> = H<
  BlankEnv,
  Schema[R]["path"],
  {
    in: Schema[R]["request"];
    out: Schema[R]["request"];
    outputFormat: "json";
  },
  HandlerResponse<Schema[R]["response"]>
>;
