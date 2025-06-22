import { Database } from "@shared/database.gen.ts";

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

const convertIntervalToMSMultiplier = (
  interval: NonNullable<
    Database["public"]["CompositeTypes"]["ModuleScheduleConfig"]["interval"]
  >,
): number | undefined => {
  switch (interval) {
    case "YEARS":
      return 1000 * 60 * 60 * 24 * 365;
    case "MONTHS":
      return 1000 * 60 * 60 * 24 * 30;
    case "WEEKS":
      return 1000 * 60 * 60 * 24 * 7;
    case "DAYS":
      return 1000 * 60 * 60 * 24;
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

  let nextRunDate = new Date(next_run);
  const isPast = nextRunDate.getTime() < Date.now();
  console.log("haptic-test", "Calculating next cron job", {
    next_run,
    schedule_config,
    isPast,
    originalNextRun: nextRunDate.toISOString(),
  });
  if (isPast) {
    const msMultiplier = convertIntervalToMSMultiplier(
      schedule_config.interval,
    );

    if (!msMultiplier) {
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
    nextRunDate = new Date(
      nextRunDate.getTime() + schedule_config.quantity * msMultiplier,
    );
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
