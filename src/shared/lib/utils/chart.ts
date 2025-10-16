import { Transformer } from '@/shared/lib/utils/types';

export type ChartRange = 'D' | 'W' | 'M';

export type FilterForRangeArgs<T, R = never> = {
  data: T[];
  getDate: (item: T) => Date;
  transform: Transformer<T, R extends never ? T : R>;
  range: ChartRange;
};

/**
 * Filters a dataset based on a specified time range.
 *
 * Based on the range, the function returns a sparse version of the passed array.
 *
 * The resulting array contains only the data points that match the specified range
 * (values are not accumulated or aggregated). You can think of this function as a
 * funnel that determines which data points are valid to include in the output.
 *
 * @param args - The arguments for the filtering function.
 * @param args.data - The array of data to filter.
 * @param args.range - The time range filter ('D' for days, 'W' for weeks, 'M' for months).
 * @param args.getDate - A function that extracts the date from each data item.
 * @param args.transform - A transformation function to apply to each filtered item.
 *
 * @return An array of transformed and filtered items according to the range and transformation logic.
 */
export function filterForRange<T, R>(args: FilterForRangeArgs<T, R>): R[] {
  const { data, range, getDate, transform = (v) => v as any } = args;

  const result: R[] = [];

  let latestPoint: T | null = null;
  let lastValidPoint: T | null = null;

  for (const item of data) {
    let _item: T | null = null;

    const date = getDate(item);

    // Find the nearest point to the current date in case if the range is not a day
    if (range !== 'D') {
      if (latestPoint) {
        if (date > getDate(latestPoint)) {
          latestPoint = item;
        }
      } else {
        latestPoint = item;
      }
    }

    switch (range) {
      case 'D': {
        _item = item;

        lastValidPoint = item;

        break;
      }
      case 'W': {
        const pointDay = date.getDay();

        if (pointDay === 0) {
          _item = item;

          lastValidPoint = item;
        }

        break;
      }
      case 'M': {
        const lastDayOfMonth = new Date(
          date.getFullYear(),
          date.getMonth() + 1,
          0
        );

        const pointDate = date.getDate();

        if (pointDate === lastDayOfMonth.getDate()) {
          _item = item;

          lastValidPoint = item;
        }

        break;
      }
    }

    if (!_item) continue;

    result.push(transform(_item));
  }

  /**
   * Append the result with data from the latest point if the last array point is not nearly enough.
   * For example, if there is selected the monthly range is selected and it is the middle of the
   * active month now, then there should be added one more point representing today's date.
   *
   * Otherwise, the result will contain only the last day of the previous month.
   */
  if (latestPoint && lastValidPoint) {
    const ltsDate = getDate(latestPoint);

    const lastDate = getDate(lastValidPoint);

    if (ltsDate > lastDate) {
      result.push(transform(latestPoint));
    }
  }

  return result;
}

/**
 * Filters a dataset based on a specified time range.
 *
 * Based on the range, the function returns a sparse version of the passed array.
 *
 * The resulting array contains only the data points that match the specified range
 * with aggregated values. You can think of this function as a
 * funnel that determines which data points are valid to include in the output.
 *
 * @param args - The arguments for the filtering function.
 * @param args.data - The array of data to filter.
 * @param args.range - The time range filter ('D' for days, 'W' for weeks, 'M' for months).
 * @param args.getDate - A function that extracts the date from each data item.
 * @param args.transform - A transformation function to apply to each filtered item.
 *
 * @return An array of transformed and filtered items according to the range and transformation logic.
 */

export function aggregateByBarSize<T, R>(args: FilterForRangeArgs<T, R>): R[] {
  const { data, range, getDate, transform = (v) => v as any } = args;

  if (!data?.length) return [];

  const now = Date.now();
  const bucketFn =
    range === 'M'
      ? endOfUTCMonth
      : range === 'W'
        ? startOfUTCWeekSun
        : startOfUTCDay;

  const map = new Map<number, number>();

  for (const item of data) {
    const date = getDate(item);
    const timestamp = date.getTime();
    const key = bucketFn(timestamp);
    const endOfPeriod =
      bucketFn === startOfUTCDay
        ? key
        : range === 'M'
          ? endOfUTCMonth(timestamp)
          : key + 6 * 24 * 60 * 60 * 1000;

    const finalKey = endOfPeriod > now ? now : endOfPeriod;
    map.set(finalKey, (map.get(finalKey) || 0) + (item as any).y);
  }

  return Array.from(map.entries()).map((item) => transform(item as T));
}

const startOfUTCDay = (timestamp: number): number => {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const startOfUTCWeekSun = (timestamp: number): number => {
  const date = new Date(timestamp);
  const diff = date.getUTCDay();
  const sunday = new Date(date);
  sunday.setUTCDate(date.getUTCDate() - diff);
  return Date.UTC(
    sunday.getUTCFullYear(),
    sunday.getUTCMonth(),
    sunday.getUTCDate()
  );
};

const endOfUTCMonth = (timestamp: number): number => {
  const date = new Date(timestamp);
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
};
