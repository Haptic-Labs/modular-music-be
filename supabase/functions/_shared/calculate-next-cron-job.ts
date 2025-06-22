import { Database } from "@shared/database.gen.ts";
import { calculateNewTimestamp } from "@shared/calculate-new-timestamp.ts";

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
  if (isPast) {
    nextRunDate = calculateNewTimestamp(
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
