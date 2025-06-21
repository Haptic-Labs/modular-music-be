import { Database } from "@shared/database.gen.ts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

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

const convertIntervalToDayJSInterval = (
  interval: NonNullable<
    Database["public"]["CompositeTypes"]["ModuleScheduleConfig"]["interval"]
  >,
): dayjs.ManipulateType | undefined => {
  switch (interval) {
    case "YEARS":
      return "year";
    case "MONTHS":
      return "month";
    case "WEEKS":
      return "week";
    case "DAYS":
      return "day";
    default:
      return undefined;
  }
};

type CalculateNextCronJobArgs = {
  next_run: string;
  schedule_config: Database["public"]["CompositeTypes"]["ModuleScheduleConfig"];
};

export const calculateNextCronJob = ({
  next_run,
  schedule_config,
}: CalculateNextCronJobArgs): string | undefined => {
  if (!schedule_config.quantity || !schedule_config.interval) {
    console.error(
      'Error calculating next cron job: missing "quantity" or "interval" in schedule_config',
      JSON.stringify(schedule_config, null, 2),
    );
    return undefined;
  }

  const nextRunDayJs = dayjs(next_run).utc();
  const isPast = new Date(next_run).getTime() < Date.now();
  if (isPast) {
    const dayjsInterval = convertIntervalToDayJSInterval(
      schedule_config.interval,
    );
    if (!dayjsInterval) {
      console.error(
        "Error converting interval to dayjs interval: invalid interval",
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
    nextRunDayJs.add(schedule_config.quantity, dayjsInterval);
  }

  const minutes = nextRunDayJs.minute();
  const hour = nextRunDayJs.hour();
  const dayOfMonth = nextRunDayJs.date();
  const month = nextRunDayJs.month() + 1; // dayjs months are 0-indexed

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
  }

  return cronString;
};
