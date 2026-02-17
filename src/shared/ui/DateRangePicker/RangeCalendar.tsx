import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

import {
  addMonths,
  buildMonthWeeks,
  formatDate,
  formatMonthLabel,
  getMonthStart,
  isSameDay,
  parseDate
} from './lib/calendarDateUtils';
import { MONTH_LABELS, WEEK_DAYS } from './constants';
import type { DateRangeValue } from './DateRangePicker';

type CalendarVariant = 'mobile' | 'desktop';
type ViewMode = 'day' | 'month' | 'year';
type ActiveSide = 'left' | 'right';

interface RangeCalendarProps {
  variant?: CalendarVariant;
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
  onCancel?: () => void;
  onClose?: () => void;
}

interface MonthNavControls {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

const getInitialMonthStart = (start: Date | null, end: Date | null): Date =>
  getMonthStart(start ?? end ?? new Date());

const RangeCalendar: FC<RangeCalendarProps> = ({
  variant = 'desktop',
  value,
  onChange,
  min,
  max,
  disabled = false,
  className,
  onCancel,
  onClose
}) => {
  const isMobile = variant === 'mobile';

  const startDate = useMemo(
    () => parseDate(value.startDate),
    [value.startDate]
  );
  const endDate = useMemo(() => parseDate(value.endDate), [value.endDate]);
  const minDate = useMemo(() => parseDate(min), [min]);
  const maxDate = useMemo(() => parseDate(max), [max]);

  const startTime = startDate?.getTime() ?? null;
  const endTime = endDate?.getTime() ?? null;
  const minTime = minDate?.getTime() ?? null;
  const maxTime = maxDate?.getTime() ?? null;

  const getInitialMonths = useCallback((): { left: Date; right: Date } => {
    const hasSelection = Boolean(startDate || endDate);
    const minMonthStart = minDate ? getMonthStart(minDate) : null;
    const maxMonthStart = maxDate ? getMonthStart(maxDate) : null;

    if (!hasSelection && maxMonthStart) {
      let right = maxMonthStart;
      let left = addMonths(right, -1);

      if (minMonthStart && left.getTime() < minMonthStart.getTime()) {
        left = minMonthStart;
      }
      if (left.getTime() >= right.getTime()) {
        right = left;
      }

      return { left, right };
    }

    const base = getInitialMonthStart(startDate, endDate);
    return { left: base, right: addMonths(base, 1) };
  }, [endDate, maxDate, minDate, startDate]);

  const [leftMonth, setLeftMonth] = useState<Date>(
    () => getInitialMonths().left
  );
  const [rightMonth, setRightMonth] = useState<Date>(
    () => getInitialMonths().right
  );
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [activeSide, setActiveSide] = useState<ActiveSide>('left');
  const [yearPageStart, setYearPageStart] = useState<number>(() => {
    const y = leftMonth.getUTCFullYear();
    return y - (y % 12);
  });

  const minMonth = minDate ? getMonthStart(minDate) : null;
  const maxMonth = maxDate ? getMonthStart(maxDate) : null;

  const clampMonthToRange = useCallback(
    (monthStart: Date): Date => {
      if (minMonth && monthStart.getTime() < minMonth.getTime())
        return new Date(minMonth.getTime());
      if (maxMonth && monthStart.getTime() > maxMonth.getTime())
        return new Date(maxMonth.getTime());
      return monthStart;
    },
    [maxMonth, minMonth]
  );

  const isMonthInRange = useCallback(
    (monthStart: Date): boolean => {
      if (minMonth && monthStart.getTime() < minMonth.getTime()) return false;
      return !(maxMonth && monthStart.getTime() > maxMonth.getTime());
    },
    [maxMonth, minMonth]
  );

  const isYearInRange = useCallback(
    (year: number): boolean => {
      const yearFirstMonth = new Date(Date.UTC(year, 0, 1));
      const yearLastMonth = new Date(Date.UTC(year, 11, 1));
      if (maxMonth && yearFirstMonth.getTime() > maxMonth.getTime())
        return false;
      return !(minMonth && yearLastMonth.getTime() < minMonth.getTime());
    },
    [maxMonth, minMonth]
  );

  const canGoPrevLeft = !minMonth || leftMonth.getTime() > minMonth.getTime();
  const canGoNextLeft =
    !maxMonth || addMonths(leftMonth, 1).getTime() <= maxMonth.getTime();
  const canGoPrevRight = !minMonth || rightMonth.getTime() > minMonth.getTime();
  const canGoNextRight =
    !maxMonth || addMonths(rightMonth, 1).getTime() <= maxMonth.getTime();

  useEffect(() => {
    setLeftMonth((prev) => clampMonthToRange(prev));
    setRightMonth((prev) => clampMonthToRange(prev));
  }, [clampMonthToRange]);

  useEffect(() => {
    setYearPageStart((prev) => {
      const base =
        activeSide === 'left'
          ? leftMonth.getUTCFullYear()
          : rightMonth.getUTCFullYear();
      const start = base - (base % 12);
      return prev === start ? prev : start;
    });
  }, [activeSide, leftMonth, rightMonth]);

  const onPrevLeftMonth = useCallback(() => {
    if (disabled || !canGoPrevLeft) return;
    setLeftMonth((prev) => addMonths(prev, -1));
  }, [disabled, canGoPrevLeft]);

  const onNextLeftMonth = useCallback(() => {
    if (disabled || !canGoNextLeft) return;
    setLeftMonth((prev) => addMonths(prev, 1));
  }, [disabled, canGoNextLeft]);

  const onPrevRightMonth = useCallback(() => {
    if (disabled || !canGoPrevRight) return;
    setRightMonth((prev) => addMonths(prev, -1));
  }, [disabled, canGoPrevRight]);

  const onNextRightMonth = useCallback(() => {
    if (disabled || !canGoNextRight) return;
    setRightMonth((prev) => addMonths(prev, 1));
  }, [disabled, canGoNextRight]);

  const handleDaySelect = useCallback(
    (date: Date) => {
      if (disabled) return;
      const dateTime = date.getTime();
      if (minTime !== null && dateTime < minTime) return;
      if (maxTime !== null && dateTime > maxTime) return;

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
        onChange({ startDate: formatted, endDate: '' });
        return;
      }

      if (!startDate && endDate) {
        if (endTime !== null && dateTime <= endTime) {
          onChange({ startDate: formatted, endDate: value.endDate });
          return;
        }
        onChange({ startDate: formatDate(endDate!), endDate: formatted });
        return;
      }

      if (startDate && !endDate) {
        if (startTime !== null && dateTime < startTime) {
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
          onChange({
            startDate: formatted,
            endDate: formatDate(endDate)
          });
          return;
        }
        if (dateTime > endTime) {
          onChange({
            startDate: formatDate(startDate),
            endDate: formatted
          });
          return;
        }
        onChange({
          startDate: formatDate(startDate),
          endDate: formatted
        });
      }
    },
    [
      disabled,
      endDate,
      endTime,
      maxTime,
      minTime,
      onChange,
      startDate,
      startTime,
      value.endDate,
      value.startDate
    ]
  );

  const leftWeeks = useMemo(() => buildMonthWeeks(leftMonth), [leftMonth]);
  const rightWeeks = useMemo(() => buildMonthWeeks(rightMonth), [rightMonth]);
  const leftLabel = useMemo(() => formatMonthLabel(leftMonth), [leftMonth]);
  const rightLabel = useMemo(() => formatMonthLabel(rightMonth), [rightMonth]);

  const renderMonth = useCallback(
    (
      monthStart: Date,
      monthLabel: string,
      weeks: Date[][],
      controls: MonthNavControls,
      options?: { onLabelClick?: () => void; layout?: 'desktop' | 'mobile' }
    ) => {
      const isMobileLayout = options?.layout === 'mobile';
      const weekDaysPadding = isMobileLayout ? 'py-2 px-1' : 'py-2';
      const weekRowPadding = 'py-1';
      const weekDayCellSize = isMobileLayout ? 'min-w-0' : 'w-10';
      const dayButtonSize = isMobileLayout
        ? 'h-[42px] aspect-square'
        : 'h-10 w-10';

      return (
        <div
          className={cn(
            'bg-primary-15 flex flex-col items-center gap-2 p-2',
            isMobileLayout ? 'h-[390px] w-[295px] gap-2' : 'h-[372px] w-[304px]'
          )}
        >
          <div className='relative flex h-10 w-full items-center justify-center px-1 py-3'>
            <button
              type='button'
              className={cn(
                'absolute top-1/2 left-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md transition-opacity',
                isMobileLayout && 'left-0',
                {
                  'text-secondary-22 cursor-default opacity-40':
                    !controls.canPrev || disabled,
                  'hover:bg-secondary-22 text-secondary-10':
                    controls.canPrev && !disabled
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
            <button
              type='button'
              className={cn(
                'rounded-md px-2 py-1',
                options?.onLabelClick && !disabled
                  ? 'hover:bg-secondary-22'
                  : 'pointer-events-none'
              )}
              onClick={options?.onLabelClick}
              disabled={!options?.onLabelClick || disabled}
            >
              <Text
                size='13'
                weight='500'
                lineHeight='16'
                align='center'
                className='text-secondary-10 dark:text-white'
              >
                {monthLabel}
              </Text>
            </button>
            <button
              type='button'
              className={cn(
                'absolute top-1/2 right-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md transition-opacity',
                isMobileLayout && 'right-0',
                {
                  'text-secondary-22 cursor-default opacity-40':
                    !controls.canNext || disabled,
                  'hover:bg-secondary-22 text-secondary-10':
                    controls.canNext && !disabled
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
          {isMobileLayout && (
            <div
              className='w-full shrink-0 border-t border-white/15'
              style={{ borderTopWidth: '0.5px' }}
            />
          )}
          <div className='flex w-full flex-col gap-1'>
            <div
              className={cn('grid w-full grid-cols-7 px-1', weekDaysPadding)}
            >
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
            <div className='flex w-full flex-col gap-0'>
              {weeks.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  className={cn('grid grid-cols-7 gap-0 px-1', weekRowPadding)}
                >
                  {week.map((day, dayIndex) => {
                    const isCurrentMonth =
                      day.getUTCMonth() === monthStart.getUTCMonth();
                    const isStartMonthPanel =
                      !!startDate &&
                      monthStart.getUTCFullYear() ===
                        startDate.getUTCFullYear() &&
                      monthStart.getUTCMonth() === startDate.getUTCMonth();
                    const isEndMonthPanel =
                      !!endDate &&
                      monthStart.getUTCFullYear() ===
                        endDate.getUTCFullYear() &&
                      monthStart.getUTCMonth() === endDate.getUTCMonth();
                    const isRangeStartRaw = isSameDay(day, startDate);
                    const isRangeEndRaw = isSameDay(day, endDate);
                    const isRangeStart = isRangeStartRaw && isStartMonthPanel;
                    const isRangeEnd = isRangeEndRaw && isEndMonthPanel;
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
                    const prevDay = dayIndex > 0 ? week[dayIndex - 1] : null;
                    const nextDay =
                      dayIndex < week.length - 1 ? week[dayIndex + 1] : null;
                    const prevTime = prevDay?.getTime() ?? null;
                    const nextTime = nextDay?.getTime() ?? null;
                    const isPrevInRange =
                      startTime !== null &&
                      endTime !== null &&
                      prevTime !== null &&
                      prevTime >= startTime &&
                      prevTime <= endTime;
                    const isNextInRange =
                      startTime !== null &&
                      endTime !== null &&
                      nextTime !== null &&
                      nextTime >= startTime &&
                      nextTime <= endTime;
                    const isSegmentCell =
                      isRangeStart || isRangeEnd || isInRange;
                    const isSegmentStart = isSegmentCell && !isPrevInRange;
                    const isSegmentEnd = isSegmentCell && !isNextInRange;
                    const rangeFillShadow =
                      isSegmentCell &&
                      isNextInRange &&
                      (isRangeStart || isRangeEnd
                        ? 'shadow-[1px_0_0_0_var(--color-success-11)]'
                        : 'shadow-[1px_0_0_0_var(--color-primary-18)]');
                    let dayRadius: string | undefined;
                    if (isSingleSelection || !startDate || !endDate) {
                      dayRadius = 'rounded-lg';
                    } else if (startTime !== null && endTime !== null) {
                      dayRadius =
                        isSegmentStart && isSegmentEnd
                          ? 'rounded-lg'
                          : cn({
                              'rounded-l-lg': isSegmentStart,
                              'rounded-r-lg': isSegmentEnd
                            });
                    }
                    const textClass = cn(
                      'text-[13px] font-[500] leading-[22px] text-center',
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
                          'flex items-center justify-center font-[500] focus-visible:outline-none',
                          dayButtonSize,
                          dayBackground,
                          dayRadius,
                          rangeFillShadow,
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
    },
    [
      disabled,
      endDate,
      endTime,
      handleDaySelect,
      maxTime,
      minTime,
      startDate,
      startTime
    ]
  );

  const handleMonthLabelClickLeft = useCallback(() => {
    if (disabled) return;
    setActiveSide('left');
    setViewMode('month');
  }, [disabled]);

  const handleMonthLabelClickRight = useCallback(() => {
    if (disabled) return;
    setActiveSide('right');
    setViewMode('month');
  }, [disabled]);

  const renderMonthPicker = useCallback(() => {
    const activeMonth = activeSide === 'left' ? leftMonth : rightMonth;
    const year = activeMonth.getUTCFullYear();
    const monthIndex = activeMonth.getUTCMonth();

    const prevYearMonth = new Date(Date.UTC(year - 1, monthIndex, 1));
    const nextYearMonth = new Date(Date.UTC(year + 1, monthIndex, 1));
    const canGoPrevYear = isYearInRange(year - 1);
    const canGoNextYear = isYearInRange(year + 1);

    const handlePrevYear = () => {
      if (disabled || !canGoPrevYear) return;
      const next = clampMonthToRange(prevYearMonth);
      if (activeSide === 'left') setLeftMonth(next);
      else setRightMonth(next);
    };

    const handleNextYear = () => {
      if (disabled || !canGoNextYear) return;
      const next = clampMonthToRange(nextYearMonth);
      if (activeSide === 'left') setLeftMonth(next);
      else setRightMonth(next);
    };

    const handleYearLabelClick = () => {
      if (disabled) return;
      setViewMode('year');
    };

    const handleMonthSelect = (monthIndex: number) => {
      if (disabled) return;
      const candidate = new Date(Date.UTC(year, monthIndex, 1));
      if (!isMonthInRange(candidate)) return;
      const next = candidate;
      if (activeSide === 'left') setLeftMonth(next);
      else setRightMonth(next);
      setViewMode('day');
    };

    const isSelectedMonth = (index: number) =>
      (activeSide === 'left' &&
        leftMonth.getUTCFullYear() === year &&
        leftMonth.getUTCMonth() === index) ||
      (activeSide === 'right' &&
        rightMonth.getUTCFullYear() === year &&
        rightMonth.getUTCMonth() === index);

    return (
      <div className='bg-primary-15 flex h-[372px] w-[608px] flex-col items-center gap-4 p-2'>
        <div className='relative flex h-10 w-full items-center justify-center px-1 py-3'>
          <button
            type='button'
            className={cn(
              'absolute top-1/2 left-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md transition-opacity',
              {
                'cursor-default opacity-40': !canGoPrevYear || disabled,
                'hover:bg-secondary-22': canGoPrevYear && !disabled
              }
            )}
            onClick={handlePrevYear}
            aria-label='Previous year'
            disabled={!canGoPrevYear || disabled}
          >
            <Icon
              name='arrow-left'
              className='h-6 w-6'
              color='secondary-10'
              isRound={false}
            />
          </button>
          <button
            type='button'
            className='hover:bg-secondary-22 rounded-md px-2 py-1'
            onClick={handleYearLabelClick}
            disabled={disabled}
          >
            <Text
              size='13'
              weight='500'
              lineHeight='16'
              align='center'
              className='text-secondary-10'
            >
              {year}
            </Text>
          </button>
          <button
            type='button'
            className={cn(
              'absolute top-1/2 right-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md transition-opacity',
              {
                'cursor-default opacity-40': !canGoNextYear || disabled,
                'hover:bg-secondary-22': canGoNextYear && !disabled
              }
            )}
            onClick={handleNextYear}
            aria-label='Next year'
            disabled={!canGoNextYear || disabled}
          >
            <Icon
              name='arrow-right'
              className='h-6 w-6'
              color='secondary-10'
              isRound={false}
            />
          </button>
        </div>
        <div className='grid h-full w-full grid-cols-4 place-items-center gap-y-6'>
          {MONTH_LABELS.map((label, index) => {
            const monthStart = new Date(Date.UTC(year, index, 1));
            const isDisabledMonth = !isMonthInRange(monthStart);
            return (
              <button
                key={label}
                type='button'
                className={cn(
                  'text-secondary-10 flex h-9 w-16 items-center justify-center rounded-lg text-[13px] leading-[22px] font-medium',
                  {
                    'bg-success-11 text-white': isSelectedMonth(index),
                    'cursor-not-allowed opacity-40':
                      isDisabledMonth || disabled,
                    'hover:bg-secondary-22': !isDisabledMonth && !disabled
                  }
                )}
                onClick={() => handleMonthSelect(index)}
                disabled={isDisabledMonth || disabled}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }, [
    activeSide,
    clampMonthToRange,
    disabled,
    isMonthInRange,
    isYearInRange,
    leftMonth,
    rightMonth
  ]);

  const renderYearPicker = useCallback(() => {
    const years = Array.from({ length: 12 }, (_, idx) => yearPageStart + idx);
    const baseMonth =
      activeSide === 'left'
        ? leftMonth.getUTCMonth()
        : rightMonth.getUTCMonth();
    const minYear = minDate?.getUTCFullYear() ?? null;
    const maxYear = maxDate?.getUTCFullYear() ?? null;
    const canGoPrevPage = minYear === null || yearPageStart > minYear;
    const canGoNextPage = maxYear === null || yearPageStart + 11 < maxYear;

    const handlePrevPage = () => {
      if (disabled || !canGoPrevPage) return;
      setYearPageStart((prev) => prev - 12);
    };

    const handleNextPage = () => {
      if (disabled || !canGoNextPage) return;
      setYearPageStart((prev) => prev + 12);
    };

    const handleYearSelect = (year: number) => {
      if (disabled) return;
      const candidate = new Date(Date.UTC(year, baseMonth, 1));
      const next = clampMonthToRange(candidate);
      if (activeSide === 'left') setLeftMonth(next);
      else setRightMonth(next);
      setViewMode('month');
    };

    const isYearDisabled = (year: number): boolean => {
      const yearFirstMonth = new Date(Date.UTC(year, 0, 1));
      const yearLastMonth = new Date(Date.UTC(year, 11, 1));
      if (maxMonth && yearFirstMonth.getTime() > maxMonth.getTime())
        return true;
      return !!(minMonth && yearLastMonth.getTime() < minMonth.getTime());
    };

    const isSelectedYear = (y: number) =>
      (activeSide === 'left' && leftMonth.getUTCFullYear() === y) ||
      (activeSide === 'right' && rightMonth.getUTCFullYear() === y);

    const rangeLabel = `${years[0]} - ${years[years.length - 1]}`;

    return (
      <div className='bg-primary-15 flex h-[372px] w-[608px] flex-col items-center gap-4 p-2'>
        <div className='relative flex h-10 w-full items-center justify-center px-1 py-3'>
          <button
            type='button'
            className={cn(
              'absolute top-1/2 left-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md transition-opacity',
              {
                'cursor-default opacity-40': !canGoPrevPage || disabled,
                'hover:bg-secondary-22': canGoPrevPage && !disabled
              }
            )}
            onClick={handlePrevPage}
            aria-label='Previous years'
            disabled={!canGoPrevPage || disabled}
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
            {rangeLabel}
          </Text>
          <button
            type='button'
            className={cn(
              'absolute top-1/2 right-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md transition-opacity',
              {
                'cursor-default opacity-40': !canGoNextPage || disabled,
                'hover:bg-secondary-22': canGoNextPage && !disabled
              }
            )}
            onClick={handleNextPage}
            aria-label='Next years'
            disabled={!canGoNextPage || disabled}
          >
            <Icon
              name='arrow-right'
              className='h-6 w-6'
              color='secondary-10'
              isRound={false}
            />
          </button>
        </div>
        <div className='grid h-full w-full grid-cols-4 place-items-center gap-y-6'>
          {years.map((year) => {
            const yearDisabled = isYearDisabled(year);
            return (
              <button
                key={year}
                type='button'
                className={cn(
                  'text-secondary-10 flex h-9 w-16 items-center justify-center rounded-lg text-[13px] leading-[22px] font-medium',
                  {
                    'bg-success-11 text-white': isSelectedYear(year),
                    'cursor-not-allowed opacity-40': yearDisabled || disabled,
                    'hover:bg-secondary-22': !yearDisabled && !disabled
                  }
                )}
                onClick={() => handleYearSelect(year)}
                disabled={yearDisabled || disabled}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>
    );
  }, [
    activeSide,
    clampMonthToRange,
    disabled,
    leftMonth,
    maxDate,
    maxMonth,
    minDate,
    minMonth,
    rightMonth,
    yearPageStart
  ]);

  const renderContent = () => {
    if (viewMode === 'month') return renderMonthPicker();
    if (viewMode === 'year') return renderYearPicker();
    if (isMobile) {
      return renderMonth(
        leftMonth,
        leftLabel,
        leftWeeks,
        {
          onPrev: onPrevLeftMonth,
          onNext: onNextLeftMonth,
          canPrev: canGoPrevLeft,
          canNext: canGoNextLeft
        },
        { layout: 'mobile' }
      );
    }
    return (
      <>
        {renderMonth(
          leftMonth,
          leftLabel,
          leftWeeks,
          {
            onPrev: onPrevLeftMonth,
            onNext: onNextLeftMonth,
            canPrev: canGoPrevLeft,
            canNext: canGoNextLeft
          },
          { onLabelClick: handleMonthLabelClickLeft }
        )}
        {renderMonth(
          rightMonth,
          rightLabel,
          rightWeeks,
          {
            onPrev: onPrevRightMonth,
            onNext: onNextRightMonth,
            canPrev: canGoPrevRight,
            canNext: canGoNextRight
          },
          { onLabelClick: handleMonthLabelClickRight }
        )}
      </>
    );
  };

  const mobileFooter = isMobile && (onClose || onCancel) && (
    <>
      <div
        className='w-full shrink-0 border-t border-white/15'
        style={{ borderTopWidth: '0.5px' }}
      />
      <div className='flex h-11 w-full gap-2'>
        <button
          type='button'
          className='bg-secondary-16 text-secondary-10 flex h-11 flex-1 items-center justify-center rounded-full text-[13px] leading-[18px] font-medium'
          onClick={() => {
            if (onCancel) onCancel();
            else onClose?.();
          }}
        >
          Cancel
        </button>
        <button
          type='button'
          className='bg-success-11 flex h-11 flex-1 items-center justify-center rounded-full text-[13px] leading-[18px] font-medium text-white'
          onClick={onClose}
        >
          Select
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div
        className={cn(
          'bg-primary-15 flex w-[359px] max-w-[calc(100vw-16px)] flex-col items-center gap-4 rounded-2xl px-8 pt-4 pb-8',
          className,
          { 'pointer-events-none opacity-60': disabled }
        )}
      >
        {renderContent()}
        {mobileFooter}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-primary-15 outline-secondary-19 flex h-[412px] w-[640px] flex-col items-center gap-4 rounded-lg p-4 outline',
        className,
        { 'pointer-events-none opacity-60': disabled }
      )}
    >
      <div className='flex h-[372px] w-[608px] flex-row'>{renderContent()}</div>
    </div>
  );
};

export default RangeCalendar;
