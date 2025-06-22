import { Database } from "@shared/database.gen.ts";
import { add } from "@addDateFn";

type ConstructCronStringArgs = {
  minutes: number;
  hour: number;
  dayOfMonth: number;
  month: number;
};

const constructCronString = (
  args: ConstructCronStringArgs,
): string | undefined => {
  const { minutes, hour, dayOfMonth, month } = {
    minutes: Math.floor(args.minutes),
    hour: Math.floor(args.hour),
    dayOfMonth: Math.floor(args.dayOfMonth),
    month: Math.floor(args.month),
  };
  let result = "";
  if (minutes < 0 || minutes > 59) {
    return undefined;
  }
  result += `${minutes.toFixed(0)} `;

  if (hour < 0 || hour > 23) {
    return undefined;
  }
  result += `${hour.toFixed(0)} `;

  if (dayOfMonth < 1 || dayOfMonth > 31) {
    return undefined;
  }
  result += `${dayOfMonth.toFixed(0)} `;

  if (month < 1 || month > 12) {
    return undefined;
  }
  result += `${month.toFixed(0)} *`;
  return result;
};

const calculateNextRunFromSchedule = (
  timestamp: string,
  scheduleConfig: Database["public"]["CompositeTypes"]["ModuleScheduleConfig"],
): Date | undefined => {
  if (scheduleConfig.quantity === null || scheduleConfig.interval === null) {
    return undefined;
  }

  switch (scheduleConfig.interval) {
    case "YEARS":
      return add(new Date(timestamp), {
        years: scheduleConfig.quantity,
      });
    case "MONTHS":
      return add(new Date(timestamp), {
        months: scheduleConfig.quantity,
      });
    case "WEEKS":
      return add(new Date(timestamp), {
        weeks: scheduleConfig.quantity,
      });
    case "DAYS":
      return add(new Date(timestamp), {
        days: scheduleConfig.quantity,
      });
  }
};

type CalculateNextCronJobArgs = {
  next_run: string;
  schedule_config: Database["public"]["CompositeTypes"]["ModuleScheduleConfig"];
};

export const calculateNextCronJob = ({
  next_run,
  schedule_config,
}: CalculateNextCronJobArgs):
  | { cronString: string; nextRun: string }
  | undefined => {
  if (!schedule_config.quantity || !schedule_config.interval) {
    console.error(
      'Error calculating next cron job: missing "quantity" or "interval" in schedule_config',
      JSON.stringify(schedule_config, null, 2),
    );
    return undefined;
  }

  let nextRunDate: Date | undefined = new Date(next_run);
  const isPast = nextRunDate.getTime() < Date.now();
  console.log("haptic-test", "Calculating next cron job", {
    next_run,
    schedule_config,
    isPast,
    originalNextRun: nextRunDate.toISOString(),
  });
  if (isPast) {
    nextRunDate = calculateNextRunFromSchedule(
      nextRunDate.toISOString(),
      schedule_config,
    );

    if (!nextRunDate) {
      console.error(
        "Error converting interval to multiplier",
        JSON.stringify(
          {
            schedule_config,
          },
          null,
          2,
        ),
      );
      return undefined;
    }
    console.log("haptic-test", "Calculated next cron job", {
      calculateNextRun: nextRunDate.toISOString(),
    });
  }

  const minutes = nextRunDate.getUTCMinutes();
  const hour = nextRunDate.getUTCHours();
  const dayOfMonth = nextRunDate.getUTCDate();
  const month = nextRunDate.getUTCMonth() + 1; // Month is 0-indexed in JavaScript

  const cronString = constructCronString({
    minutes,
    hour,
    dayOfMonth,
    month,
  });
  console.log("haptic-test", "Constructed cron string", {
    cronString,
    minutes,
    hour,
    dayOfMonth,
    month,
  });
  if (!cronString) {
    console.error(
      "Error constructing cron string: invalid time values",
      JSON.stringify(
        {
          minutes,
          hour,
          dayOfMonth,
          month,
        },
        null,
        2,
      ),
    );
    return undefined;
  }

  return { cronString, nextRun: nextRunDate.toISOString() };
};
