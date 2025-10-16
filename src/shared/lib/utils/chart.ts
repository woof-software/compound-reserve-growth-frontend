import { Transformer } from '@/shared/lib/utils/types';

export type ChartRange = 'D' | 'W' | 'M';

export type FilterForRangeArgs<T, R> = {
  data: T[];
  getDate: (item: T) => Date;
  transform: Transformer<T, R>;
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
  const { data, range, getDate, transform } = args;

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

export type AggregateByBarSizeArgs<T, R = never> = {
  data: T[];
  getDate: (item: T) => Date;
  /**
   * The function will be called for each item in the data array.
   * It should return the value of the item which can be used for summarization.
   */
  getValue: (item: T) => number;
  /**
   * The function will be called for each valid item in the data array.
   * Aggregator function doesn't know which even property of the object has to be updated
   * in the result of summarization. So, it will use the callback to apply the value on the target object.
   *
   * IMPORTANT
   * Remember that the item passed to the callback is an original item from the data array. So, doesn't
   * change it directly and return a new object with the updated value.
   *
   * It should return the item with the value applied (summarized).
   */
  applyValue: (item: T, value: number) => T;
  transform: Transformer<T, R>;
  range: ChartRange;
};

/**
 * Filters a dataset based on a specified time range and aggregates the values.
 *
 * Based on the range, the function returns a sparse version of the passed array where each
 * item is the aggregated sum of the values between the item itself and the previous one.
 *
 * The resulting array contains only the data points that match the specified range
 * with aggregated values. You can think of this function as a funnel that determines which
 * data points are valid to be included in the output.
 *
 * @param args - The arguments for the filtering function.
 * @param args.data - The array of data to filter.
 * @param args.range - The time range filter ('D' for days, 'W' for weeks, 'M' for months).
 * @param args.getDate - A function that extracts the date from each data item.
 * @param args.getValue - A function that extracts the value from each data item.
 * @param args.applyValue - A function that should applies the value to the data item.
 * @param args.transform - A transformation function to apply to each filtered item.
 *
 * @return An array of transformed and filtered items according to the range and transformation logic.
 */
export function aggregateByBarSize<T, R>(
  args: AggregateByBarSizeArgs<T, R>
): R[] {
  const { data, range, getDate, transform, getValue, applyValue } = args;

  const result: R[] = [];

  let latestPoint: T | null = null;
  let lastValidPoint: T | null = null;

  let summarizedValue = 0;

  for (const item of data) {
    let _item: T | null = null;

    const date = getDate(item);
    const value = getValue(item);

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
          _item = applyValue(item, summarizedValue);

          lastValidPoint = applyValue(item, summarizedValue);
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
          _item = applyValue(item, summarizedValue);

          lastValidPoint = applyValue(item, summarizedValue);
        }

        break;
      }
    }

    summarizedValue += value;

    if (!_item) continue;

    summarizedValue = 0;

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
      result.push(transform(applyValue(latestPoint, summarizedValue)));
    }
  }

  return result;
}
