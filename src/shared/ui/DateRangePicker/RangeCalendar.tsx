import React, { FC, useEffect, useMemo, useState } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

import type { DateRangeValue } from './DateRangePicker';

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
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
];

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

  return weeks;
};

type CalendarVariant = 'mobile' | 'desktop';

interface RangeCalendarProps {
  variant?: CalendarVariant;
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
  /** Called when user taps Cancel (mobile/adaptive). */
  onCancel?: () => void;
  /** Called when user taps Select / closes calendar (mobile/adaptive). */
  onClose?: () => void;
}

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

  const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('day');
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left');
  const [yearPageStart, setYearPageStart] = useState<number>(() => {
    const baseYear = leftMonth.getUTCFullYear();
    return baseYear - (baseYear % 12);
  });
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

  const minMonth = minDate ? getMonthStart(minDate) : null;
  const maxMonth = maxDate ? getMonthStart(maxDate) : null;

  const canGoPrevLeft = !minMonth || leftMonth.getTime() > minMonth.getTime();
  const canGoNextLeft =
    !maxMonth || addMonths(leftMonth, 1).getTime() <= maxMonth.getTime();
  const canGoPrevRight = !minMonth || rightMonth.getTime() > minMonth.getTime();
  const canGoNextRight =
    !maxMonth || addMonths(rightMonth, 1).getTime() <= maxMonth.getTime();

  const onPrevLeftMonth = () => {
    if (disabled || !canGoPrevLeft) return;
    setLeftMonth((prev) => addMonths(prev, -1));
  };
  const onNextLeftMonth = () => {
    if (disabled || !canGoNextLeft) return;
    setLeftMonth((prev) => addMonths(prev, 1));
  };
  const onPrevRightMonth = () => {
    if (disabled || !canGoPrevRight) return;
    setRightMonth((prev) => addMonths(prev, -1));
  };
  const onNextRightMonth = () => {
    if (disabled || !canGoNextRight) return;
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
      const dateMonth = getMonthStart(date);
      setLeftMonth(addMonths(dateMonth, -1));
      setRightMonth(dateMonth);
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
  };

  const renderMonth = (
    monthStart: Date,
    monthLabel: string,
    weeks: Date[][],
    controls: {
      onPrev: () => void;
      onNext: () => void;
      canPrev: boolean;
      canNext: boolean;
    },
    options?: {
      onLabelClick?: () => void;
      layout?: 'desktop' | 'mobile';
    }
  ) => {
    const isMobileLayout = options?.layout === 'mobile';
    const weekDaysPadding = isMobileLayout ? 'py-2 px-1' : 'py-2';
    const weekRowPadding = isMobileLayout ? 'py-1' : 'py-1';
    const weekDayCellSize = isMobileLayout ? 'min-w-0' : 'w-10';
    const dayButtonSize = isMobileLayout
      ? 'h-[42px] aspect-square'
      : 'h-10 w-10';

    return (
      <div
        className={cn(
          'bg-primary-15 flex flex-col items-center gap-2 p-2',
          isMobileLayout ? 'h-[390px] w-[295px] gap-2' : 'h-[420px] w-[304px]'
        )}
      >
        <div
          className={cn(
            'relative flex w-full items-center justify-center px-1 py-3',
            isMobileLayout ? 'h-10' : 'h-10'
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
              className='text-secondary-10'
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
            className='w-full shrink-0 border-t border-[rgba(255,255,255,0.15)]'
            style={{ borderTopWidth: '0.5px' }}
          />
        )}
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
                  const isStartMonthPanel =
                    !!startDate &&
                    monthStart.getUTCFullYear() ===
                      startDate.getUTCFullYear() &&
                    monthStart.getUTCMonth() === startDate.getUTCMonth();
                  const isEndMonthPanel =
                    !!endDate &&
                    monthStart.getUTCFullYear() === endDate.getUTCFullYear() &&
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

  const renderMonthPicker = () => {
    const activeMonth = activeSide === 'left' ? leftMonth : rightMonth;
    const year = activeMonth.getUTCFullYear();

    const handlePrevYear = () => {
      if (disabled) return;
      const next = new Date(Date.UTC(year - 1, activeMonth.getUTCMonth(), 1));
      if (activeSide === 'left') {
        setLeftMonth(next);
      } else {
        setRightMonth(next);
      }
    };

    const handleNextYear = () => {
      if (disabled) return;
      const next = new Date(Date.UTC(year + 1, activeMonth.getUTCMonth(), 1));
      if (activeSide === 'left') {
        setLeftMonth(next);
      } else {
        setRightMonth(next);
      }
    };

    const handleYearLabelClick = () => {
      if (disabled) return;
      setViewMode('year');
    };

    const handleMonthSelect = (monthIndex: number) => {
      if (disabled) return;
      const next = new Date(Date.UTC(year, monthIndex, 1));
      if (activeSide === 'left') {
        setLeftMonth(next);
      } else {
        setRightMonth(next);
      }
      setViewMode('day');
    };

    return (
      <div className='bg-primary-15 flex h-[372px] w-[608px] flex-col items-center gap-4 p-2'>
        <div className='relative flex h-10 w-full items-center justify-center px-1 py-3'>
          <button
            type='button'
            className={cn(
              'hover:bg-secondary-22 absolute top-1/2 left-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md'
            )}
            onClick={handlePrevYear}
            aria-label='Previous year'
            disabled={disabled}
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
              'hover:bg-secondary-22 absolute top-1/2 right-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md'
            )}
            onClick={handleNextYear}
            aria-label='Next year'
            disabled={disabled}
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
          {MONTH_LABELS.map((label, index) => (
            <button
              key={label}
              type='button'
              className={cn(
                'text-secondary-10 hover:bg-secondary-22 flex h-9 w-16 items-center justify-center rounded-lg text-[13px] leading-[22px] font-medium',
                {
                  'bg-success-11 text-white':
                    (activeSide === 'left' &&
                      leftMonth.getUTCFullYear() === year &&
                      leftMonth.getUTCMonth() === index) ||
                    (activeSide === 'right' &&
                      rightMonth.getUTCFullYear() === year &&
                      rightMonth.getUTCMonth() === index)
                }
              )}
              onClick={() => handleMonthSelect(index)}
              disabled={disabled}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderYearPicker = () => {
    const years = Array.from({ length: 12 }, (_, idx) => yearPageStart + idx);

    const handlePrevPage = () => {
      if (disabled) return;
      setYearPageStart((prev) => prev - 12);
    };

    const handleNextPage = () => {
      if (disabled) return;
      setYearPageStart((prev) => prev + 12);
    };

    const handleYearSelect = (year: number) => {
      if (disabled) return;
      const baseMonth =
        activeSide === 'left'
          ? leftMonth.getUTCMonth()
          : rightMonth.getUTCMonth();
      const next = new Date(Date.UTC(year, baseMonth, 1));
      if (activeSide === 'left') {
        setLeftMonth(next);
      } else {
        setRightMonth(next);
      }
      setViewMode('month');
    };

    const rangeLabel = `${years[0]} - ${years[years.length - 1]}`;

    return (
      <div className='bg-primary-15 flex h-[372px] w-[608px] flex-col items-center gap-4 p-2'>
        <div className='relative flex h-10 w-full items-center justify-center px-1 py-3'>
          <button
            type='button'
            className='hover:bg-secondary-22 absolute top-1/2 left-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md'
            onClick={handlePrevPage}
            aria-label='Previous years'
            disabled={disabled}
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
            className='hover:bg-secondary-22 absolute top-1/2 right-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md'
            onClick={handleNextPage}
            aria-label='Next years'
            disabled={disabled}
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
          {years.map((year) => (
            <button
              key={year}
              type='button'
              className={cn(
                'text-secondary-10 hover:bg-secondary-22 flex h-9 w-16 items-center justify-center rounded-lg text-[13px] leading-[22px] font-medium',
                {
                  'bg-success-11 text-white':
                    (activeSide === 'left' &&
                      leftMonth.getUTCFullYear() === year) ||
                    (activeSide === 'right' &&
                      rightMonth.getUTCFullYear() === year)
                }
              )}
              onClick={() => handleYearSelect(year)}
              disabled={disabled}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (viewMode === 'month') {
      return renderMonthPicker();
    }
    if (viewMode === 'year') {
      return renderYearPicker();
    }
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
          {
            onLabelClick: () => {
              if (disabled) return;
              setActiveSide('left');
              setViewMode('month');
            }
          }
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
          {
            onLabelClick: () => {
              if (disabled) return;
              setActiveSide('right');
              setViewMode('month');
            }
          }
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
            if (onCancel) {
              onCancel();
            } else if (onClose) {
              onClose();
            }
          }}
        >
          Cancel
        </button>
        <button
          type='button'
          className='bg-success-11 text-secondary-10 flex h-11 flex-1 items-center justify-center rounded-full text-[13px] leading-[18px] font-medium'
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
        'bg-primary-15 outline-secondary-19 flex h-[460px] w-[640px] flex-col items-center gap-4 rounded-lg p-4 outline',
        className,
        { 'pointer-events-none opacity-60': disabled }
      )}
    >
      <div className='flex h-[436px] w-[608px] flex-row'>{renderContent()}</div>
    </div>
  );
};

export default RangeCalendar;
