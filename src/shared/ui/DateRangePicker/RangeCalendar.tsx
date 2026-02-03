import React, { FC, useEffect, useMemo, useState } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

import type { DateRangeValue } from './DateRangePicker';

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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

  const [baseMonth, setBaseMonth] = useState<Date>(() => {
    const initial = startDate ?? endDate ?? new Date();
    return getMonthStart(initial);
  });

  useEffect(() => {
    const activeDate = startDate ?? endDate;
    if (!activeDate) return;

    const activeMonth = getMonthStart(activeDate);
    const nextMonth = addMonths(baseMonth, 1);
    const isVisible =
      isSameMonth(activeMonth, baseMonth) ||
      isSameMonth(activeMonth, nextMonth);

    if (!isVisible) {
      setBaseMonth(activeMonth);
    }
  }, [baseMonth, endDate, startDate]);

  const minMonth = minDate ? getMonthStart(minDate) : null;
  const maxMonth = maxDate ? getMonthStart(maxDate) : null;
  const nextMonth = useMemo(() => addMonths(baseMonth, 1), [baseMonth]);

  const canGoPrev = !minMonth || baseMonth.getTime() > minMonth.getTime();
  const canGoNext = !maxMonth || nextMonth.getTime() <= maxMonth.getTime();

  const onPrevMonth = () => {
    if (disabled || !canGoPrev) return;
    setBaseMonth((prev) => addMonths(prev, -1));
  };

  const onNextMonth = () => {
    if (disabled || !canGoNext) return;
    setBaseMonth((prev) => addMonths(prev, 1));
  };

  const handleDaySelect = (date: Date) => {
    if (disabled) return;
    const isBeforeMin = minDate && date.getTime() < minDate.getTime();
    const isAfterMax = maxDate && date.getTime() > maxDate.getTime();
    if (isBeforeMin || isAfterMax) return;

    const formatted = formatDate(date);

    if (!startDate || endDate) {
      onChange({ startDate: formatted, endDate: '' });
      return;
    }

    if (date.getTime() < startDate.getTime()) {
      onChange({ startDate: formatted, endDate: '' });
      return;
    }

    onChange({ startDate: formatDate(startDate), endDate: formatted });
  };

  const renderMonth = (
    monthStart: Date,
    controls: {
      showPrev: boolean;
      showNext: boolean;
      onPrev: () => void;
      onNext: () => void;
      canPrev: boolean;
      canNext: boolean;
    }
  ) => {
    const weeks = buildMonthWeeks(monthStart);
    const monthLabel = monthStart.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });

    return (
      <div className='bg-primary-15 flex w-full flex-col items-center gap-2 p-2 md:w-[304px]'>
        <div className='relative flex h-10 w-full items-center justify-center px-1'>
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
        <div className='bg-secondary-39 h-px w-full' />
        <div className='flex w-full flex-col gap-1'>
          <div className='grid w-full grid-cols-7 px-1 py-2'>
            {WEEK_DAYS.map((day) => (
              <Text
                key={day}
                size='11'
                weight='500'
                lineHeight='12'
                align='center'
                className='text-secondary-10 tracking-[0.03em] capitalize'
              >
                {day}
              </Text>
            ))}
          </div>
          <div className='flex w-full flex-col'>
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className='grid grid-cols-7 px-1 py-1'
              >
                {week.map((day) => {
                  const isCurrentMonth =
                    day.getUTCMonth() === monthStart.getUTCMonth();
                  const isRangeStart = isSameDay(day, startDate);
                  const isRangeEnd = isSameDay(day, endDate);
                  const isInRange =
                    startDate &&
                    endDate &&
                    day.getTime() >= startDate.getTime() &&
                    day.getTime() <= endDate.getTime();
                  const isOutsideMin =
                    minDate && day.getTime() < minDate.getTime();
                  const isOutsideMax =
                    maxDate && day.getTime() > maxDate.getTime();
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

                  const dayRadius = isSingleSelection
                    ? 'rounded-lg'
                    : cn({
                        'rounded-l-lg': isRangeStart,
                        'rounded-r-lg': isRangeEnd
                      });

                  const textClass = cn(
                    'text-[13px] font-medium leading-[22px]',
                    {
                      'text-white': isRangeStart || isRangeEnd,
                      'text-secondary-10':
                        !isRangeStart &&
                        !isRangeEnd &&
                        (!isDayDisabled || isInRange),
                      'text-secondary-33 opacity-60':
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
                        'flex h-10 w-10 items-center justify-center focus-visible:outline-none',
                        dayBackground,
                        dayRadius,
                        {
                          'cursor-not-allowed': isDayDisabled,
                          'hover:bg-secondary-22':
                            !isDayDisabled && !isInRange && !disabled
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
        'bg-primary-15 flex w-full max-w-[640px] flex-col items-center gap-4 rounded-lg p-4',
        className,
        { 'pointer-events-none opacity-60': disabled }
      )}
    >
      <div className='flex w-full max-w-[608px] flex-col gap-4 md:flex-row md:gap-0'>
        {renderMonth(baseMonth, {
          showPrev: true,
          showNext: false,
          onPrev: onPrevMonth,
          onNext: onNextMonth,
          canPrev: canGoPrev,
          canNext: canGoNext
        })}
        {renderMonth(nextMonth, {
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
