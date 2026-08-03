import React, { ChangeEvent, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useModal } from '@/shared/hooks/useModal';
import { cn } from '@/shared/lib/classNames/classNames';
import { handleDateInput, inputDateToTimestamp, timestampToInputDate } from '@/shared/lib/date/dateUtils';
import { noop } from '@/shared/lib/utils/utils';
import { MEDIA_QUERY_DESKTOP } from '@/shared/lib/viewport/viewport';
import Button from '@/shared/ui/Button/Button';
import { Dropdown } from '@/shared/ui/DropdownRef/Dropdown';
import Icon from '@/shared/ui/Icon/Icon';
import Portal from '@/shared/ui/Portal/Portal';
import Text from '@/shared/ui/Text/Text';

import Calendar from './Calendar';

const CALENDAR_DESKTOP_WIDTH = 640;
const CALENDAR_DESKTOP_MARGIN = 16;
const CALENDAR_DESKTOP_OFFSET_Y = 8;

export type DateRangeValue = {
  startDate: number | null;
  endDate: number | null;
};

// Validates a complete YYYY-MM-DD string, including calendar validity (e.g. month 22 is invalid).
// Partial / empty inputs are considered valid (not yet complete).
const isValidDateString = (str: string): boolean => {
  if (!str || str.length < 10) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const [y, m, d] = str.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

interface DateInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  defaultValue: string;
  min: string;
  max: string;
  disabled: boolean;
  className: string;
  label?: string;
  showLabel: boolean;
  onCalendarToggle: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onClick: (e: React.MouseEvent<HTMLInputElement>) => void;
  error?: string;
  errorClassName?: string;
  hasError?: boolean;
}

const DateInput: FC<DateInputProps> = ({
   inputRef,
   defaultValue,
   disabled,
   className,
   label,
   showLabel,
   onCalendarToggle,
   onChange,
   onBlur,
   onClick,
   error,
   errorClassName,
   hasError = false,
 }) => (
  <div className='flex flex-col gap-0'>
    {showLabel && !!label && (
      <div className='flex h-6 items-center rounded-lg px-3 py-1'>
        <Text size='11' weight='500' lineHeight='16' className='text-secondary-41 dark:text-secondary-33'>
          {label}
        </Text>
      </div>
    )}
    <div
      className={cn('relative rounded-lg outline', {
        'outline-red-11': !!error || hasError,
        'outline-secondary-19': !error && !hasError,
      })}
    >
      <input
        ref={inputRef}
        type='text'
        inputMode='numeric'
        defaultValue={defaultValue}
        onChange={(e) => {
          handleDateInput(e);
          onChange(e);
        }}
        onBlur={onBlur}
        disabled={disabled}
        onClick={onClick}
        placeholder='YYYY-MM-DD'
        className={className}
      />
      <Button
        type='button'
        className='absolute top-1/2 right-3 z-10 h-6 w-6 -translate-y-1/2'
        onClick={onCalendarToggle}
        disabled={disabled}
        aria-label='Open calendar'
        data-calendar-toggle='true'
      />
    </div>
    {!!error && (
      <Text size='11' weight='500' lineHeight='16' className={cn('text-red-11 mt-1', errorClassName)}>
        {error}
      </Text>
    )}
  </div>
);

export interface DateRangePickerProps {
  value: DateRangeValue;
  onChange?: (next: DateRangeValue) => void;
  min?: number | null;
  max?: number | null;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  showLabels?: boolean;
  clearLabel?: string;
  onClose?: () => void;
  inlineCalendar?: boolean;
}

export interface DateRangePickerPopoverProps extends DateRangePickerProps {
  triggerClassName?: string;
  popoverContentClassName?: string;
  placeholder?: string;
}

const DateRangePicker: FC<DateRangePickerProps> = ({
   value,
   onChange = noop,
   min = null,
   max = null,
   disabled = false,
   className,
   inputClassName,
   showLabels = true,
   clearLabel = 'Clear filters',
   onClose: onCloseContainer,
   inlineCalendar = false,
 }) => {
  const { isOpen: isCalendarOpen, onCloseModal: onCloseCalendar, onToggleModal: onToggleCalendar } = useModal();

  const anchorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  const [calendarTransform, setCalendarTransform] = useState({ top: 0, left: 0 });

  // Raw strings typed by the user — needed to validate before a timestamp is produced
  const [startRaw, setStartRaw] = useState<string>(() => timestampToInputDate(value.startDate));
  const [endRaw, setEndRaw] = useState<string>(() => timestampToInputDate(value.endDate));

  // --- Validation ---
  const startComplete = startRaw.length === 10;
  const endComplete = endRaw.length === 10;

  const startInvalid = startComplete && !isValidDateString(startRaw);
  const endInvalid = endComplete && !isValidDateString(endRaw);
  const rangeInvalid =
    startComplete &&
    endComplete &&
    !startInvalid &&
    !endInvalid &&
    value.startDate !== null &&
    value.endDate !== null &&
    value.endDate < value.startDate;

  // Start field: own format error takes priority; range error only highlights the outline (message lives on end)
  const startError = startInvalid ? 'Invalid date' : '';
  const startHasRangeError = !startInvalid && rangeInvalid;

  // End field: own format error takes priority; otherwise show the range message
  const endError = endInvalid ? 'Invalid date' : rangeInvalid ? 'Start date must precede end' : '';

  const hasRange = value.startDate !== null || value.endDate !== null;

  const updateCalendarPosition = useCallback(() => {
    if (!anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const top = rect.bottom + CALENDAR_DESKTOP_OFFSET_Y + scrollY;
    let left = rect.left + scrollX;

    if (left + CALENDAR_DESKTOP_WIDTH + CALENDAR_DESKTOP_MARGIN > scrollX + window.innerWidth) {
      left = scrollX + window.innerWidth - CALENDAR_DESKTOP_WIDTH - CALENDAR_DESKTOP_MARGIN;
    }
    if (left < scrollX + CALENDAR_DESKTOP_MARGIN) {
      left = scrollX + CALENDAR_DESKTOP_MARGIN;
    }

    setCalendarTransform((prev) => {
      const unchanged = Math.abs(prev.top - top) < 0.5 && Math.abs(prev.left - left) < 0.5;
      return unchanged ? prev : { top, left };
    });
  }, []);

  const updateRange = useCallback(
    (startDate: number | null, endDate: number | null) => {
      if (value.startDate === startDate && value.endDate === endDate) return;
      onChange({ startDate, endDate });
    },
    [onChange, value.startDate, value.endDate],
  );

  const onStartChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.currentTarget.value;
      setStartRaw(raw);
      const next = inputDateToTimestamp(raw);
      if (next !== null) updateRange(next, value.endDate);
    },
    [updateRange, value.endDate],
  );

  const onEndChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.currentTarget.value;
      setEndRaw(raw);
      const next = inputDateToTimestamp(raw);
      if (next !== null) updateRange(value.startDate, next);
    },
    [updateRange, value.startDate],
  );

  const onStartBlur = useCallback(() => {
    if (startInputRef.current?.value || value.startDate === null) return;
    updateRange(null, value.endDate);
  }, [updateRange, value.endDate, value.startDate]);

  const onEndBlur = useCallback(() => {
    if (endInputRef.current?.value || value.endDate === null) return;
    updateRange(value.startDate, null);
  }, [updateRange, value.startDate, value.endDate]);

  const onClear = useCallback(() => {
    updateRange(null, null);
    onCloseContainer?.();
  }, [onCloseContainer, updateRange]);

  const handleCalendarCancel = useCallback(() => updateRange(null, null), [updateRange]);

  const handleCalendarClose = useCallback(() => {
    onCloseCalendar();
    onCloseContainer?.();
  }, [onCloseCalendar, onCloseContainer]);

  const handleInputClick = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      if (disabled) e.preventDefault();
    },
    [disabled],
  );

  const handleCalendarToggleClick = useCallback(() => {
    if (disabled || isCalendarOpen) return;
    updateCalendarPosition();
    onToggleCalendar();
  }, [disabled, isCalendarOpen, onToggleCalendar, updateCalendarPosition]);

  const stopPropagation = useCallback((e: React.SyntheticEvent) => e.stopPropagation(), []);

  const inputClassName_ = useMemo(
    () =>
      cn(
        'date-range-input bg-custom-trigger text-primary-14 h-10 w-full rounded-lg px-3 py-3 pr-14 text-[11px] font-medium leading-4 focus-visible:outline-none',
        { 'cursor-not-allowed opacity-60': disabled },
        inputClassName,
      ),
    [disabled, inputClassName],
  );

  // Sync raw state when value is changed externally (e.g. calendar selection, clear)
  useEffect(() => {
    if (document.activeElement === startInputRef.current) return;
    setStartRaw(timestampToInputDate(value.startDate));
  }, [value.startDate]);

  useEffect(() => {
    if (document.activeElement === endInputRef.current) return;
    setEndRaw(timestampToInputDate(value.endDate));
  }, [value.endDate]);

  useEffect(() => {
    if (!isCalendarOpen) return;

    const scheduleUpdate = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateCalendarPosition();
      });
    };

    scheduleUpdate();

    const controller = new AbortController();
    window.addEventListener('resize', scheduleUpdate, {
      signal: controller.signal,
    });

    return () => {
      controller.abort();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isCalendarOpen, updateCalendarPosition]);

  useEffect(() => {
    const sync = (input: HTMLInputElement | null, timestamp: number | null) => {
      if (!input || document.activeElement === input) return;
      const next = timestampToInputDate(timestamp);
      if (input.value !== next) input.value = next;
    };

    sync(startInputRef.current, value.startDate);
    sync(endInputRef.current, value.endDate);
  }, [value.startDate, value.endDate]);

  const minInput = timestampToInputDate(min);
  const maxInput = timestampToInputDate(max);

  const sharedCalendarProps = {
    value,
    onChange,
    min,
    max,
    disabled,
    onCancel: handleCalendarCancel,
    onClose: handleCalendarClose,
  };

  const sharedInputProps = {
    min: minInput,
    max: maxInput,
    disabled,
    className: inputClassName_,
    showLabel: showLabels,
    onClick: handleInputClick,
    onCalendarToggle: handleCalendarToggleClick,
  };

  if (inlineCalendar) {
    return (
      <Calendar
        variant='mobile'
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        disabled={disabled}
        className={className}
        onCancel={handleCalendarCancel}
        onClose={onCloseContainer}
      />
    );
  }

  return (
    <>
      <div
        ref={anchorRef}
        className={cn(
          'relative mx-auto flex w-full max-w-[359px] flex-col items-stretch gap-3 rounded-lg p-4 lg:mx-0 lg:w-[168px] lg:max-w-none lg:gap-2 lg:p-2',
          className,
          { 'z-[50]': isCalendarOpen },
        )}
        onPointerDown={(e) => {
          if (!isCalendarOpen) return;
          if ((e.target as HTMLElement).closest('[data-calendar-toggle="true"]')) return;
          onCloseCalendar();
        }}
      >
        <DateInput
          inputRef={startInputRef}
          defaultValue={timestampToInputDate(value.startDate)}
          label='Start'
          onChange={onStartChange}
          onBlur={onStartBlur}
          error={startError}
          hasError={startHasRangeError}
          {...sharedInputProps}
        />
        <DateInput
          inputRef={endInputRef}
          defaultValue={timestampToInputDate(value.endDate)}
          label='End'
          onChange={onEndChange}
          onBlur={onEndBlur}
          error={endError}
          {...sharedInputProps}
        />
        {hasRange && (
          <>
            <div className='bg-primary-12 dark:bg-secondary-24 -mx-4 h-[0.25px] w-[calc(100%+32px)] self-stretch lg:-mx-2 lg:w-[calc(100%+16px)]' />
            <Button
              className={cn(
                'text-primary-14 mt-0 h-[30px] w-full rounded-lg px-3 py-2 text-[11px] font-medium dark:hover:text-white',
                'bg-secondary-12 hover:bg-secondary-40',
              )}
              onClick={onClear}
              disabled={disabled}
            >
              {clearLabel}
            </Button>
          </>
        )}
      </div>
      {isCalendarOpen && (
        <Portal>
          <div className='hidden lg:block'>
            <div
              className='shadow-15 absolute top-0 left-0 z-[60]'
              style={{
                transform: `translate3d(${calendarTransform.left}px, ${calendarTransform.top}px, 0)`,
              }}
              onPointerDown={stopPropagation}
            >
              <Calendar variant='desktop' {...sharedCalendarProps} />
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

const DateRangePickerPopover: FC<DateRangePickerPopoverProps> = ({
 placeholder = 'Date range',
 triggerClassName,
 ...pickerProps
}) => {
  const { value, disabled = false } = pickerProps;
  const { isOpen, onOpenModal, onCloseModal, onToggleModal } = useModal();

  const hasSelection = value.startDate !== null || value.endDate !== null;

  const rangeLabel = useMemo(() => {
    const { startDate, endDate } = value;

    const start = timestampToInputDate(startDate);
    const end = timestampToInputDate(endDate);

    if (start && end) return `${start} - ${end}`;
    if (start) return `${start} - ...`;
    if (end) return `... - ${end}`;

    return placeholder;
  }, [placeholder, value]);

  useEffect(() => {
    if (!isOpen) return;
    const mql = window.matchMedia(MEDIA_QUERY_DESKTOP);
    mql.addEventListener('change', onCloseModal);
    return () => mql.removeEventListener('change', onCloseModal);
  }, [isOpen, onCloseModal]);

  const trigger = (
    <Button
      className='cursor-pointer'
      onClick={onToggleModal}
    >
      <div
        className={cn(
          'bg-custom-trigger flex h-[32px] items-center gap-1.5 rounded-lg p-1.5 pr-3 text-[11px] font-medium',
          { 'opacity-60': disabled },
          triggerClassName
        )}
      >
        <div className='p-0.5'>
          <Icon
            name={hasSelection ? 'calendar-check' : 'calendar-uncheck'}
            className='h-4 w-4'
            color={hasSelection ? 'secondary-10' : 'color-gray-11'}
            isRound={false}
          />
        </div>
        <span
          className={cn(
            'text-[11px] leading-[16px] font-medium',
            hasSelection ? 'text-secondary-10' : 'text-gray-11'
          )}
        >
          {rangeLabel}
        </span>
      </div>
    </Button>
  );

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={onOpenModal}
      onClose={onCloseModal}
      trigger={trigger}
    >
      <DateRangePicker
        {...pickerProps}
        onClose={onCloseModal}
      />
    </Dropdown>
  );
};

export { DateRangePickerPopover };
export default DateRangePicker;
