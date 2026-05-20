import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import { getEndOfDayTimestamp } from '@/shared/lib/date/dateUtils';
import { DateRangeValue } from '@/shared/ui/DateRangePicker/DateRangePicker';

const SECOND_IN_MS = 1000;

const toUtcDayStartMs = (timestampSeconds: number): number => {
  const date = new Date(timestampSeconds * SECOND_IN_MS);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

type DateBounds = { min: number | null; max: number | null };
type NormalizedDateRange = { start: number | null; end: number | null };

type UseDateRangeFilterOptions = {
  availableDates?: number[];
};

type UseDateRangeFilterReturn = {
  dateRange: DateRangeValue;
  setDateRange: Dispatch<SetStateAction<DateRangeValue>>;
  normalizedDateRange: NormalizedDateRange;
  dateBounds: DateBounds;
  resetDateRange: () => void;
  mobileFilterOption: {
    id: string;
    placeholder: string;
    total: number;
    selectedOptions: never[];
    options: never[];
    disableSelectAll: true;
    type: 'dateRange';
    dateRange: DateRangeValue;
    minDate: number | null;
    maxDate: number | null;
    onDateRangeChange: Dispatch<SetStateAction<DateRangeValue>>;
  };
};

const EMPTY_DATE_RANGE: DateRangeValue = { startDate: null, endDate: null };

export const useDateRangeFilter = ({
  availableDates = []
}: UseDateRangeFilterOptions = {}): UseDateRangeFilterReturn => {
  const [dateRange, setDateRange] = useState<DateRangeValue>(EMPTY_DATE_RANGE);

  const normalizedDateRange = useMemo<NormalizedDateRange>(() => {
    let rangeStart = dateRange.startDate;
    let rangeEnd = dateRange.endDate;

    if (rangeStart !== null && rangeEnd !== null && rangeStart > rangeEnd) {
      [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
    }

    return {
      start: rangeStart,
      end: rangeEnd !== null ? getEndOfDayTimestamp(rangeEnd) : null
    };
  }, [dateRange]);

  // availableDates is sorted newest first, so last element is oldest
  const dateBounds = useMemo<DateBounds>(() => {
    if (!availableDates.length) return { min: null, max: null };
    return {
      min: toUtcDayStartMs(availableDates[availableDates.length - 1]),
      max: toUtcDayStartMs(availableDates[0])
    };
  }, [availableDates]);

  const resetDateRange = () => setDateRange(EMPTY_DATE_RANGE);

  const mobileFilterOption = {
    id: 'dateRange',
    placeholder: 'Date range',
    total: Number(dateRange.startDate !== null || dateRange.endDate !== null),
    selectedOptions: [] as never[],
    options: [] as never[],
    disableSelectAll: true as const,
    type: 'dateRange' as const,
    dateRange,
    minDate: dateBounds.min,
    maxDate: dateBounds.max,
    onDateRangeChange: setDateRange
  };

  return {
    dateRange,
    setDateRange,
    normalizedDateRange,
    dateBounds,
    resetDateRange,
    mobileFilterOption
  };
};
