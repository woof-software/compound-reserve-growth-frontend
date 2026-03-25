// @/shared/hooks/useBarSizeConstraints.ts
import { useEffect, useMemo } from 'react';

import { getMaxBarSizeForRange } from '@/shared/lib/date/dateUtils';
import { BAR_SIZE, BAR_SIZE_OPTIONS } from '@/shared/types/types';

type NormalizedDateRange = { start: number | null; end: number | null };

const BAR_SIZE_ORDER = {
  [BAR_SIZE.D]: 0,
  [BAR_SIZE.W]: 1,
  [BAR_SIZE.M]: 2
} as const;

type UseBarSizeConstraintsReturn = {
  disabledBarSizes: BAR_SIZE[];
};

/**
 * * Constrains bar size selection based on the selected date range.
 *  *
 *  * - Disables bar sizes that exceed the range span (e.g. hides W/M when range < 7 days).
 *  * - Auto-downgrades `barSize` via `onBarSizeChange` if the current value becomes invalid.
 *  *
 *  * @param normalizedDateRange - Normalized `{ start, end }` in ms from `useDateRangeFilter`
 *  * @param barSize - Current bar size value
 *  * @param onBarSizeChange - Setter from `useChartControls`
 *  * @returns `disabledBarSizes` — list of `BAR_SIZE` values to pass as `disabledTabs` to `TabsGroup`
 *
 */

export const useBarSizeConstraints = (
  normalizedDateRange: NormalizedDateRange,
  barSize: BAR_SIZE,
  onBarSizeChange: (value: string) => void
): UseBarSizeConstraintsReturn => {
  const maxSelectableBarSize = useMemo<BAR_SIZE>(() => {
    const { start, end } = normalizedDateRange;
    if (start === null || end === null) return BAR_SIZE.M;
    return getMaxBarSizeForRange(start, end);
  }, [normalizedDateRange]);

  const disabledBarSizes = useMemo<BAR_SIZE[]>(
    () =>
      BAR_SIZE_OPTIONS.filter(
        (size) => BAR_SIZE_ORDER[size] > BAR_SIZE_ORDER[maxSelectableBarSize]
      ),
    [maxSelectableBarSize]
  );

  useEffect(() => {
    const { start, end } = normalizedDateRange;
    if (start === null || end === null) return;

    const nextBarSize = getMaxBarSizeForRange(start, end);
    if (BAR_SIZE_ORDER[nextBarSize] < BAR_SIZE_ORDER[barSize]) {
      onBarSizeChange(nextBarSize);
    }
  }, [barSize, normalizedDateRange, onBarSizeChange]);

  return { disabledBarSizes };
};