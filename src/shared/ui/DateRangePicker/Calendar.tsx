import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import {
  addMonths,
  buildMonthWeeks,
  formatMonthLabel,
  getMonthStart,
  isSameDay
} from '@/shared/lib/date/dateUtils';
import { noop } from '@/shared/lib/utils/utils';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

import type { DateRangeValue } from './types';

type CalendarVariant = 'mobile' | 'desktop';
type ViewMode = 'day' | 'month' | 'year';
type ActiveSide = 'left' | 'right';

interface CalendarProps {
  variant?: CalendarVariant;
  value: DateRangeValue;
  onChange?: (next: DateRangeValue) => void;
  min?: number | null;
  max?: number | null;
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

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
] as const;

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

const Calendar: FC<CalendarProps> = ({
  variant = 'desktop',
  value,
  onChange = noop,
  min = null,
  max = null,
  disabled = false,
  className,
  onCancel,
  onClose
}) => {
  const isMobile = variant === 'mobile';

  const startDate = useMemo(
    () => (value.startDate === null ? null : new Date(value.startDate)),
    [value.startDate]
  );
  const endDate = useMemo(
    () => (value.endDate === null ? null : new Date(value.endDate)),
    [value.endDate]
  );
  const minDate = useMemo(() => (min === null ? null : new Date(min)), [min]);
  const maxDate = useMemo(() => (max === null ? null : new Date(max)), [max]);

  const startTime = value.startDate;
  const endTime = value.endDate;
  const minTime = min;
  const maxTime = max;

  const getInitialMonths = useCallback((): { left: Date; right: Date } => {
    const hasSelection = !!(startDate || endDate);
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

    const base = getMonthStart(startDate ?? endDate ?? new Date());
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
        return minMonth;
      if (maxMonth && monthStart.getTime() > maxMonth.getTime())
        return maxMonth;
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

  const isYearOutOfRange = useCallback(
    (year: number): boolean => {
      const yearFirstMonth = new Date(Date.UTC(year, 0, 1));
      const yearLastMonth = new Date(Date.UTC(year, 11, 1));
      if (maxMonth && yearFirstMonth.getTime() > maxMonth.getTime())
        return true;
      return !!(minMonth && yearLastMonth.getTime() < minMonth.getTime());
    },
    [maxMonth, minMonth]
  );

  const isYearInRange = useCallback(
    (year: number): boolean => !isYearOutOfRange(year),
    [isYearOutOfRange]
  );

  const getMonthNavigation = useCallback(
    (month: Date): Pick<MonthNavControls, 'canPrev' | 'canNext'> => ({
      canPrev: !minMonth || month.getTime() > minMonth.getTime(),
      canNext: !maxMonth || addMonths(month, 1).getTime() <= maxMonth.getTime()
    }),
    [maxMonth, minMonth]
  );

  const leftMonthControls = useMemo<MonthNavControls>(() => {
    const { canPrev, canNext } = getMonthNavigation(leftMonth);
    return {
      canPrev,
      canNext,
      onPrev: () => {
        if (disabled || !canPrev) return;
        setLeftMonth((prev) => addMonths(prev, -1));
      },
      onNext: () => {
        if (disabled || !canNext) return;
        setLeftMonth((prev) => addMonths(prev, 1));
      }
    };
  }, [disabled, getMonthNavigation, leftMonth]);

  const rightMonthControls = useMemo<MonthNavControls>(() => {
    const { canPrev, canNext } = getMonthNavigation(rightMonth);
    return {
      canPrev,
      canNext,
      onPrev: () => {
        if (disabled || !canPrev) return;
        setRightMonth((prev) => addMonths(prev, -1));
      },
      onNext: () => {
        if (disabled || !canNext) return;
        setRightMonth((prev) => addMonths(prev, 1));
      }
    };
  }, [disabled, getMonthNavigation, rightMonth]);

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

  const setMonthForActiveSide = useCallback(
    (month: Date) => {
      if (activeSide === 'left') {
        setLeftMonth(month);
        return;
      }
      setRightMonth(month);
    },
    [activeSide]
  );

  const handleDaySelect = useCallback(
    (date: Date) => {
      if (disabled) return;
      const dateTime = date.getTime();
      if (minTime !== null && dateTime < minTime) return;
      if (maxTime !== null && dateTime > maxTime) return;

      const isStartSame = startDate !== null && isSameDay(date, startDate);
      const isEndSame = endDate !== null && isSameDay(date, endDate);

      let nextRange: DateRangeValue;

      if (isStartSame) {
        nextRange = { startDate: null, endDate: value.endDate };
      } else if (isEndSame) {
        nextRange = { startDate: value.startDate, endDate: null };
      } else if (value.startDate === null && value.endDate === null) {
        nextRange = { startDate: dateTime, endDate: null };
      } else if (value.startDate === null && value.endDate !== null) {
        nextRange =
          dateTime <= value.endDate
            ? { startDate: dateTime, endDate: value.endDate }
            : { startDate: value.endDate, endDate: dateTime };
      } else if (value.startDate !== null && value.endDate === null) {
        nextRange =
          dateTime < value.startDate
            ? { startDate: dateTime, endDate: value.startDate }
            : { startDate: value.startDate, endDate: dateTime };
      } else if (value.startDate !== null && value.endDate !== null) {
        nextRange =
          dateTime < value.startDate
            ? { startDate: dateTime, endDate: value.endDate }
            : { startDate: value.startDate, endDate: dateTime };
      } else {
        return;
      }

      onChange(nextRange);
    },
    [
      disabled,
      endDate,
      maxTime,
      minTime,
      onChange,
      startDate,
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
      const weekDaysPadding = 'py-2';
      const weekRowPadding = 'py-1';
      const weekDayCellSize = isMobileLayout ? 'min-w-0' : 'w-10';
      const dayButtonSize = isMobileLayout ? 'h-[42px] w-full' : 'h-10 w-10';

      return (
        <div
          className={cn(
            'bg-primary-15 flex flex-col items-center gap-2',
            isMobileLayout
              ? 'h-auto min-h-[390px] w-full gap-2 p-0'
              : 'h-[372px] w-[304px] p-2'
          )}
        >
          <div
            className={cn(
              'relative flex h-10 w-full items-center justify-center py-3',
              isMobileLayout ? 'px-0' : 'px-1'
            )}
          >
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
          <div className='flex w-full flex-col gap-1'>
            <div
              className={cn('grid w-full grid-cols-7', weekDaysPadding, {
                'px-1': !isMobileLayout
              })}
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
                  className={cn('grid grid-cols-7 gap-0', weekRowPadding, {
                    'px-1': !isMobileLayout
                  })}
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
                    const isRangeStartRaw =
                      startDate !== null && isSameDay(day, startDate);
                    const isRangeEndRaw =
                      endDate !== null && isSameDay(day, endDate);
                    const isRangeStart = isRangeStartRaw && isStartMonthPanel;
                    const isRangeEnd = isRangeEndRaw && isEndMonthPanel;
                    const isSingleDateInOtherMonth =
                      (!endDate &&
                        !!startDate &&
                        isRangeStartRaw &&
                        !isStartMonthPanel) ||
                      (!startDate &&
                        !!endDate &&
                        isRangeEndRaw &&
                        !isEndMonthPanel);
                    const dayTime = day.getTime();
                    const isInRange =
                      startTime !== null &&
                      endTime !== null &&
                      dayTime >= startTime &&
                      dayTime <= endTime;
                    const isOutsideMin = minTime !== null && dayTime < minTime;
                    const isOutsideMax = maxTime !== null && dayTime > maxTime;
                    const isDayDisabled =
                      disabled || isOutsideMin || isOutsideMax;
                    const isSingleSelection =
                      (isRangeStart && (!endDate || isRangeEnd)) ||
                      (isRangeEnd && !startDate);
                    const dayBackground =
                      isRangeStart || isRangeEnd
                        ? 'bg-success-11'
                        : isInRange || isSingleDateInOtherMonth
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
                    const isHoverablePlainDay =
                      !isDayDisabled &&
                      !isInRange &&
                      !isSingleDateInOtherMonth &&
                      !disabled &&
                      !isRangeStart &&
                      !isRangeEnd;
                    let dayRadius: string | undefined;
                    if (
                      isSingleSelection ||
                      !startDate ||
                      !endDate ||
                      isSingleDateInOtherMonth
                    ) {
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
                          (!isDayDisabled || isInRange) &&
                          !isSingleDateInOtherMonth,
                        'text-secondary-33 opacity-[0.58]':
                          (!isCurrentMonth && !isRangeStart && !isRangeEnd) ||
                          isSingleDateInOtherMonth,
                        'text-secondary-33 opacity-40':
                          isDayDisabled &&
                          !isRangeStart &&
                          !isRangeEnd &&
                          !isSingleDateInOtherMonth
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
                            'hover:bg-secondary-22': isHoverablePlainDay,
                            'hover:rounded-lg': isHoverablePlainDay,
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
      setMonthForActiveSide(clampMonthToRange(prevYearMonth));
    };

    const handleNextYear = () => {
      if (disabled || !canGoNextYear) return;
      setMonthForActiveSide(clampMonthToRange(nextYearMonth));
    };

    const handleYearLabelClick = () => {
      if (disabled) return;
      setViewMode('year');
    };

    const handleMonthSelect = (monthIndex: number) => {
      if (disabled) return;
      const nextMonth = new Date(Date.UTC(year, monthIndex, 1));
      if (!isMonthInRange(nextMonth)) return;
      setMonthForActiveSide(nextMonth);
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
      <div
        className={cn(
          'bg-primary-15 flex flex-col items-center',
          isMobile ? 'h-auto w-full gap-3 p-0' : 'h-[372px] w-[608px] gap-4 p-2'
        )}
      >
        <div
          className={cn(
            'relative flex h-10 w-full items-center justify-center py-3',
            isMobile ? 'px-0' : 'px-1'
          )}
        >
          <button
            type='button'
            className={cn(
              'absolute top-1/2 left-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md transition-opacity',
              isMobile && 'left-0',
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
              isMobile && 'right-0',
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
        <div
          className={cn('grid w-full grid-cols-4 place-items-center', {
            'h-full gap-y-6': !isMobile,
            'gap-y-4 pb-2': isMobile
          })}
        >
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
    isMobile,
    isMonthInRange,
    isYearInRange,
    leftMonth,
    rightMonth,
    setMonthForActiveSide
  ]);

  const renderYearPicker = useCallback(() => {
    const years = Array.from({ length: 12 }, (_, idx) => yearPageStart + idx);
    const baseMonth =
      activeSide === 'left'
        ? leftMonth.getUTCMonth()
        : rightMonth.getUTCMonth();
    const minYear = minMonth?.getUTCFullYear() ?? null;
    const maxYear = maxMonth?.getUTCFullYear() ?? null;
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
      const nextMonth = clampMonthToRange(
        new Date(Date.UTC(year, baseMonth, 1))
      );
      setMonthForActiveSide(nextMonth);
      setViewMode('month');
    };

    const isSelectedYear = (y: number) =>
      (activeSide === 'left' && leftMonth.getUTCFullYear() === y) ||
      (activeSide === 'right' && rightMonth.getUTCFullYear() === y);

    const rangeLabel = `${years[0]} - ${years[years.length - 1]}`;

    return (
      <div
        className={cn(
          'bg-primary-15 flex flex-col items-center',
          isMobile ? 'h-auto w-full gap-3 p-0' : 'h-[372px] w-[608px] gap-4 p-2'
        )}
      >
        <div
          className={cn(
            'relative flex h-10 w-full items-center justify-center py-3',
            isMobile ? 'px-0' : 'px-1'
          )}
        >
          <button
            type='button'
            className={cn(
              'absolute top-1/2 left-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md transition-opacity',
              isMobile && 'left-0',
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
              isMobile && 'right-0',
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
        <div
          className={cn('grid w-full grid-cols-4 place-items-center', {
            'h-full gap-y-6': !isMobile,
            'gap-y-4 pb-2': isMobile
          })}
        >
          {years.map((year) => {
            const yearDisabled = isYearOutOfRange(year);
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
    isMobile,
    leftMonth,
    maxMonth,
    minMonth,
    rightMonth,
    isYearOutOfRange,
    setMonthForActiveSide,
    yearPageStart
  ]);

  const renderContent = () => {
    if (viewMode === 'month') return renderMonthPicker();
    if (viewMode === 'year') return renderYearPicker();
    if (isMobile) {
      return renderMonth(leftMonth, leftLabel, leftWeeks, leftMonthControls, {
        layout: 'mobile',
        onLabelClick: handleMonthLabelClickLeft
      });
    }
    return (
      <>
        {renderMonth(leftMonth, leftLabel, leftWeeks, leftMonthControls, {
          onLabelClick: handleMonthLabelClickLeft
        })}
        {renderMonth(rightMonth, rightLabel, rightWeeks, rightMonthControls, {
          onLabelClick: handleMonthLabelClickRight
        })}
      </>
    );
  };

  const mobileFooter = isMobile && (onClose || onCancel) && (
    <>
      <div className='flex h-11 w-full gap-2'>
        <button
          type='button'
          className='bg-secondary-16 text-secondary-10 flex h-11 flex-1 items-center justify-center rounded-full text-[13px] leading-[18px] font-medium'
          onClick={() => {
            if (onCancel) onCancel();
            else onClose?.();
          }}
        >
          Clear
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
          'bg-primary-15 flex w-full flex-col items-center gap-4 px-0 pt-0 pb-0',
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

export default Calendar;
