import { add } from "@addDateFn";
import { sub } from "@subDateFn";
import { Database } from "@shared/database.gen.ts";

export const calculateNewTimestamp = (
  timestamp: string,
  scheduleConfig: Database["public"]["CompositeTypes"]["ModuleScheduleConfig"],
): Date => {
  if (scheduleConfig.quantity === null || scheduleConfig.interval === null) {
    return new Date(timestamp);
  }

  const manipulateFn = scheduleConfig.quantity < 0 ? sub : add;

  switch (scheduleConfig.interval) {
    case "YEARS":
      return manipulateFn(new Date(timestamp), {
        years: scheduleConfig.quantity,
      });
    case "MONTHS":
      return manipulateFn(new Date(timestamp), {
        months: scheduleConfig.quantity,
      });
    case "WEEKS":
      return manipulateFn(new Date(timestamp), {
        weeks: scheduleConfig.quantity,
      });
    case "DAYS":
      return manipulateFn(new Date(timestamp), {
        days: scheduleConfig.quantity,
      });
  }
};
