import React, { FC, useEffect, useMemo, useState } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

import type { DateRangeValue } from './DateRangePicker';

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const formatMonthLabel = (monthStart: Date) =>
  monthStart.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });

const parseDate = (value?: string) => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const getMonthStart = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const addMonths = (date: Date, amount: number) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));

const addDays = (date: Date, amount: number) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + amount
    )
  );

const isSameDay = (a: Date | null, b: Date | null) =>
  Boolean(a && b && a.getTime() === b.getTime());

const isSameMonth = (a: Date, b: Date) =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth();

const buildMonthWeeks = (monthStart: Date) => {
  const startDay = monthStart.getUTCDay();
  const gridStart = addDays(monthStart, -startDay);
  const weeks: Date[][] = [];
  let current = gridStart;

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const week: Date[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      week.push(current);
      current = addDays(current, 1);
    }
    weeks.push(week);
  }

  const lastWeek = weeks[weeks.length - 1];
  if (lastWeek.every((day) => day.getUTCMonth() !== monthStart.getUTCMonth())) {
    weeks.pop();
  }

  return weeks;
};

interface RangeCalendarProps {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
}

const RangeCalendar: FC<RangeCalendarProps> = ({
  value,
  onChange,
  min,
  max,
  disabled = false,
  className
}) => {
  const startDate = useMemo(
    () => parseDate(value.startDate),
    [value.startDate]
  );
  const endDate = useMemo(() => parseDate(value.endDate), [value.endDate]);
  const minDate = useMemo(() => parseDate(min), [min]);
  const maxDate = useMemo(() => parseDate(max), [max]);
  const startTime = useMemo(
    () => (startDate ? startDate.getTime() : null),
    [startDate]
  );
  const endTime = useMemo(
    () => (endDate ? endDate.getTime() : null),
    [endDate]
  );
  const minTime = useMemo(
    () => (minDate ? minDate.getTime() : null),
    [minDate]
  );
  const maxTime = useMemo(
    () => (maxDate ? maxDate.getTime() : null),
    [maxDate]
  );

  const [leftMonth, setLeftMonth] = useState<Date>(() => {
    const initial = startDate ?? endDate ?? new Date();
    return getMonthStart(initial);
  });
  const [rightMonth, setRightMonth] = useState<Date>(() =>
    addMonths(getMonthStart(startDate ?? endDate ?? new Date()), 1)
  );

  const isStartLocked = Boolean(startDate && !endDate);
  const isEndLocked = Boolean(endDate && !startDate);
  useEffect(() => {
    if (!isStartLocked || !startDate) return;
    const startMonth = getMonthStart(startDate);
    if (!isSameMonth(startMonth, leftMonth)) {
      setLeftMonth(startMonth);
    }
    const minRight = startMonth;
    if (rightMonth.getTime() < minRight.getTime()) {
      setRightMonth(minRight);
    }
  }, [isStartLocked, leftMonth, rightMonth, startDate]);

  useEffect(() => {
    if (!endDate) return;
    const endMonth = getMonthStart(endDate);

    if (isEndLocked) {
      if (!isSameMonth(endMonth, rightMonth)) {
        setRightMonth(endMonth);
      }
      if (leftMonth.getTime() > endMonth.getTime()) {
        setLeftMonth(endMonth);
      }
      return;
    }

    const isVisible =
      isSameMonth(endMonth, leftMonth) || isSameMonth(endMonth, rightMonth);

    if (!isVisible) {
      setRightMonth(endMonth);
    }
  }, [endDate, isEndLocked, leftMonth, rightMonth]);

  const minMonth = minDate ? getMonthStart(minDate) : null;
  const maxMonth = maxDate ? getMonthStart(maxDate) : null;
  const canGoPrev = isStartLocked
    ? rightMonth.getTime() > leftMonth.getTime()
    : !minMonth || leftMonth.getTime() > minMonth.getTime();
  const canGoNext = isStartLocked
    ? !maxMonth || rightMonth.getTime() < maxMonth.getTime()
    : isEndLocked
      ? leftMonth.getTime() < rightMonth.getTime()
      : !maxMonth || addMonths(rightMonth, 1).getTime() <= maxMonth.getTime();

  const onPrevMonth = () => {
    if (disabled || !canGoPrev) return;
    if (isStartLocked) {
      setRightMonth((prev) => addMonths(prev, -1));
      return;
    }
    if (isEndLocked) {
      setLeftMonth((prev) => addMonths(prev, -1));
      return;
    }
    setLeftMonth((prev) => addMonths(prev, -1));
    setRightMonth((prev) => addMonths(prev, -1));
  };

  const onNextMonth = () => {
    if (disabled || !canGoNext) return;
    if (isStartLocked) {
      setRightMonth((prev) => addMonths(prev, 1));
      return;
    }
    if (isEndLocked) {
      setLeftMonth((prev) => addMonths(prev, 1));
      return;
    }
    setLeftMonth((prev) => addMonths(prev, 1));
    setRightMonth((prev) => addMonths(prev, 1));
  };

  const leftWeeks = useMemo(() => buildMonthWeeks(leftMonth), [leftMonth]);
  const rightWeeks = useMemo(() => buildMonthWeeks(rightMonth), [rightMonth]);
  const leftLabel = useMemo(() => formatMonthLabel(leftMonth), [leftMonth]);
  const rightLabel = useMemo(() => formatMonthLabel(rightMonth), [rightMonth]);

  const handleDaySelect = (date: Date) => {
    if (disabled) return;
    const dateTime = date.getTime();
    const isBeforeMin = minTime !== null && dateTime < minTime;
    const isAfterMax = maxTime !== null && dateTime > maxTime;
    if (isBeforeMin || isAfterMax) return;

    const isStartSame = isSameDay(date, startDate);
    const isEndSame = isSameDay(date, endDate);
    if (isStartSame) {
      onChange({ startDate: '', endDate: value.endDate });
      return;
    }
    if (isEndSame) {
      onChange({ startDate: value.startDate, endDate: '' });
      return;
    }

    const formatted = formatDate(date);

    if (!startDate && !endDate) {
      const startMonth = getMonthStart(date);
      setLeftMonth(startMonth);
      setRightMonth(addMonths(startMonth, 1));
      onChange({ startDate: formatted, endDate: '' });
      return;
    }

    if (!startDate && endDate) {
      if (endTime !== null && dateTime <= endTime) {
        const startMonth = getMonthStart(date);
        setLeftMonth(startMonth);
        onChange({ startDate: formatted, endDate: value.endDate });
        return;
      }
      const startMonth = getMonthStart(endDate);
      setLeftMonth(startMonth);
      setRightMonth(getMonthStart(date));
      onChange({ startDate: formatDate(endDate), endDate: formatted });
      return;
    }

    if (startDate && !endDate) {
      if (startTime !== null && dateTime < startTime) {
        const startMonth = getMonthStart(date);
        setLeftMonth(startMonth);
        setRightMonth(addMonths(startMonth, 1));
        onChange({
          startDate: formatted,
          endDate: formatDate(startDate)
        });
        return;
      }

      onChange({ startDate: formatDate(startDate), endDate: formatted });
      return;
    }

    if (startDate && endDate && startTime !== null && endTime !== null) {
      if (dateTime < startTime) {
        const startMonth = getMonthStart(date);
        setLeftMonth(startMonth);
        setRightMonth(addMonths(startMonth, 1));
        onChange({
          startDate: formatted,
          endDate: formatDate(endDate)
        });
        return;
      }

      if (dateTime > endTime) {
        const startMonth = getMonthStart(startDate);
        setLeftMonth(startMonth);
        setRightMonth(addMonths(startMonth, 1));
        onChange({
          startDate: formatDate(startDate),
          endDate: formatted
        });
        return;
      }

      const startMonth = getMonthStart(startDate);
      setLeftMonth(startMonth);
      setRightMonth(addMonths(startMonth, 1));
      onChange({
        startDate: formatDate(startDate),
        endDate: formatted
      });
    }
  };

  const renderMonth = (
    monthStart: Date,
    monthLabel: string,
    weeks: Date[][],
    controls: {
      showPrev: boolean;
      showNext: boolean;
      onPrev: () => void;
      onNext: () => void;
      canPrev: boolean;
      canNext: boolean;
    }
  ) => {
    const isSixWeeks = weeks.length === 6;
    const weekDaysPadding = isSixWeeks ? 'py-1' : 'py-2';
    const weekRowPadding = isSixWeeks ? 'py-0.5' : 'py-1';
    const weekDayCellSize = isSixWeeks ? 'w-9' : 'w-10';
    const dayButtonSize = isSixWeeks ? 'h-9 w-9' : 'h-10 w-10';
    const dividerClass = isSixWeeks ? 'bg-secondary-39/60' : 'bg-secondary-39';

    return (
      <div className='bg-primary-15 flex h-[348px] w-[304px] flex-col items-center gap-2 p-2'>
        <div className='relative flex h-10 w-full items-center justify-center px-1 py-3'>
          <button
            type='button'
            className={cn(
              'absolute top-1/2 left-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md transition-opacity',
              {
                'pointer-events-none opacity-0': !controls.showPrev,
                'opacity-40': !controls.canPrev || disabled,
                'hover:bg-secondary-22': controls.canPrev && !disabled
              }
            )}
            onClick={controls.onPrev}
            aria-label='Previous month'
            disabled={!controls.canPrev || disabled}
          >
            <Icon
              name='arrow-left'
              className='h-6 w-6'
              color='secondary-10'
              isRound={false}
            />
          </button>
          <Text
            size='13'
            weight='500'
            lineHeight='16'
            align='center'
            className='text-secondary-10'
          >
            {monthLabel}
          </Text>
          <button
            type='button'
            className={cn(
              'absolute top-1/2 right-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md transition-opacity',
              {
                'pointer-events-none opacity-0': !controls.showNext,
                'opacity-40': !controls.canNext || disabled,
                'hover:bg-secondary-22': controls.canNext && !disabled
              }
            )}
            onClick={controls.onNext}
            aria-label='Next month'
            disabled={!controls.canNext || disabled}
          >
            <Icon
              name='arrow-right'
              className='h-6 w-6'
              color='secondary-10'
              isRound={false}
            />
          </button>
        </div>
        <div className={cn('h-px w-full', dividerClass)} />
        <div className='flex w-full flex-col gap-1'>
          <div className={cn('grid w-full grid-cols-7 px-1', weekDaysPadding)}>
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                className={cn(
                  'flex items-center justify-center px-2 py-0.5',
                  weekDayCellSize
                )}
              >
                <Text
                  size='11'
                  weight='500'
                  lineHeight='12'
                  align='center'
                  className='text-secondary-10 tracking-[0.03em] capitalize'
                >
                  {day}
                </Text>
              </div>
            ))}
          </div>
          <div className='flex w-full flex-col'>
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className={cn('grid grid-cols-7 px-1', weekRowPadding)}
              >
                {week.map((day, dayIndex) => {
                  const isCurrentMonth =
                    day.getUTCMonth() === monthStart.getUTCMonth();
                  const isRangeStart = isSameDay(day, startDate);
                  const isRangeEnd = isSameDay(day, endDate);
                  const dayTime = day.getTime();
                  const isInRange =
                    startTime !== null &&
                    endTime !== null &&
                    dayTime >= startTime &&
                    dayTime <= endTime;
                  const isOutsideMin = minTime !== null && dayTime < minTime;
                  const isOutsideMax = maxTime !== null && dayTime > maxTime;
                  const isDayDisabled = Boolean(
                    disabled || isOutsideMin || isOutsideMax
                  );
                  const isSingleSelection =
                    (isRangeStart && (!endDate || isRangeEnd)) ||
                    (isRangeEnd && !startDate);

                  const dayBackground =
                    isRangeStart || isRangeEnd
                      ? 'bg-success-11'
                      : isInRange
                        ? 'bg-primary-18'
                        : '';

                  let dayRadius: string | undefined;

                  if (isSingleSelection || !startDate || !endDate) {
                    dayRadius = 'rounded-lg';
                  } else if (startTime !== null && endTime !== null) {
                    const prevDay = dayIndex > 0 ? week[dayIndex - 1] : null;

                    const nextDay =
                      dayIndex < week.length - 1 ? week[dayIndex + 1] : null;

                    const prevTime = prevDay ? prevDay.getTime() : null;
                    const nextTime = nextDay ? nextDay.getTime() : null;

                    const isPrevInRange =
                      prevTime !== null &&
                      prevTime >= startTime &&
                      prevTime <= endTime;
                    const isNextInRange =
                      nextTime !== null &&
                      nextTime >= startTime &&
                      nextTime <= endTime;

                    const isSegmentCell =
                      isRangeStart || isRangeEnd || isInRange;
                    const isSegmentStart = isSegmentCell && !isPrevInRange;
                    const isSegmentEnd = isSegmentCell && !isNextInRange;

                    if (isSegmentStart && isSegmentEnd) {
                      dayRadius = 'rounded-lg';
                    } else {
                      dayRadius = cn({
                        'rounded-l-lg': isSegmentStart,
                        'rounded-r-lg': isSegmentEnd
                      });
                    }
                  }

                  const textClass = cn(
                    'text-[13px] font-medium leading-[22px]',
                    {
                      'text-white': isRangeStart || isRangeEnd,
                      'text-secondary-10':
                        !isRangeStart &&
                        !isRangeEnd &&
                        (!isDayDisabled || isInRange),
                      'text-secondary-33 opacity-[0.58]':
                        !isCurrentMonth && !isRangeStart && !isRangeEnd,
                      'text-secondary-33 opacity-40':
                        isDayDisabled && !isRangeStart && !isRangeEnd
                    }
                  );

                  return (
                    <button
                      key={day.toISOString()}
                      type='button'
                      className={cn(
                        'flex items-center justify-center focus-visible:outline-none',
                        dayButtonSize,
                        dayBackground,
                        dayRadius,
                        {
                          'cursor-not-allowed': isDayDisabled,
                          'hover:bg-secondary-22':
                            !isDayDisabled &&
                            !isInRange &&
                            !disabled &&
                            !isRangeStart &&
                            !isRangeEnd,
                          'hover:rounded-lg':
                            !isDayDisabled &&
                            !isInRange &&
                            !disabled &&
                            !isRangeStart &&
                            !isRangeEnd,
                          'hover:brightness-125':
                            (isRangeStart || isRangeEnd) &&
                            !isDayDisabled &&
                            !disabled
                        }
                      )}
                      onClick={() => handleDaySelect(day)}
                      aria-pressed={isRangeStart || isRangeEnd}
                      disabled={isDayDisabled}
                    >
                      <span className={textClass}>{day.getUTCDate()}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'bg-primary-15 flex h-[380px] w-[640px] flex-col items-center gap-4 rounded-lg p-4',
        className,
        { 'pointer-events-none opacity-60': disabled }
      )}
    >
      <div className='flex h-[348px] w-[608px] flex-row'>
        {renderMonth(leftMonth, leftLabel, leftWeeks, {
          showPrev: true,
          showNext: false,
          onPrev: onPrevMonth,
          onNext: onNextMonth,
          canPrev: canGoPrev,
          canNext: canGoNext
        })}
        {renderMonth(rightMonth, rightLabel, rightWeeks, {
          showPrev: false,
          showNext: true,
          onPrev: onPrevMonth,
          onNext: onNextMonth,
          canPrev: canGoPrev,
          canNext: canGoNext
        })}
      </div>
    </div>
  );
};

export default RangeCalendar;
