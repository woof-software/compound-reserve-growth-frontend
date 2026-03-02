import React, {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { useModal } from '@/shared/hooks/useModal';
import { cn } from '@/shared/lib/classNames/classNames';
import {
  formatTimestampForLabel,
  inputDateToTimestamp,
  timestampToInputDate
} from '@/shared/lib/date/dateUtils';
import { noop } from '@/shared/lib/utils/utils';
import { MEDIA_QUERY_DESKTOP } from '@/shared/lib/viewport/viewport';
import Button from '@/shared/ui/Button/Button';
import { Dropdown } from '@/shared/ui/Dropdown/Dropdown';
import Icon from '@/shared/ui/Icon/Icon';
import Portal from '@/shared/ui/Portal/Portal';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

import Calendar from './Calendar';
import { DateRangeValue } from './types';

const CALENDAR_DESKTOP_WIDTH = 640;
const CALENDAR_DESKTOP_MARGIN = 16;
const CALENDAR_DESKTOP_OFFSET_Y = 8;

export interface DateRangePickerProps {
  value: DateRangeValue;
  onChange?: (next: DateRangeValue) => void;
  min?: number | null;
  max?: number | null;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  showLabels?: boolean;
  showClear?: boolean;
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
  showLabels = false,
  showClear = false,
  clearLabel = 'Clear Filter',
  onClose: onCloseContainer,
  inlineCalendar = false
}) => {
  const {
    isOpen: isCalendarOpen,
    onCloseModal: onCloseCalendar,
    onToggleModal: onToggleCalendar
  } = useModal();

  const anchorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const [calendarTransform, setCalendarTransform] = useState({
    top: 0,
    left: 0
  });

  const updateCalendarPosition = useCallback(() => {
    if (!anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let left = rect.left + scrollX;
    const top = rect.bottom + CALENDAR_DESKTOP_OFFSET_Y + scrollY;

    if (
      left + CALENDAR_DESKTOP_WIDTH + CALENDAR_DESKTOP_MARGIN >
      scrollX + window.innerWidth
    ) {
      left =
        scrollX +
        window.innerWidth -
        CALENDAR_DESKTOP_WIDTH -
        CALENDAR_DESKTOP_MARGIN;
    }

    if (left < scrollX + CALENDAR_DESKTOP_MARGIN) {
      left = scrollX + CALENDAR_DESKTOP_MARGIN;
    }

    setCalendarTransform((prev) => {
      const isSame =
        Math.abs(prev.top - top) < 0.5 && Math.abs(prev.left - left) < 0.5;
      return isSame ? prev : { top, left };
    });
  }, []);

  const onStartChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextStart = inputDateToTimestamp(event.target.value);
      onChange({ startDate: nextStart, endDate: value.endDate });
    },
    [onChange, value.endDate]
  );

  const onEndChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextEnd = inputDateToTimestamp(event.target.value);
      onChange({ startDate: value.startDate, endDate: nextEnd });
    },
    [onChange, value.startDate]
  );

  const onClear = useCallback(() => {
    onChange({ startDate: null, endDate: null });
    onCloseContainer?.();
  }, [onChange, onCloseContainer]);

  const handleCalendarCancel = useCallback(() => {
    onChange({ startDate: null, endDate: null });
  }, [onChange]);

  const handleCalendarClose = useCallback(() => {
    onCloseCalendar();
    onCloseContainer?.();
  }, [onCloseCalendar, onCloseContainer]);

  const handleInputClick = useCallback(
    (event: React.MouseEvent<HTMLInputElement>) => {
      if (disabled) return;
      event.preventDefault();
    },
    [disabled]
  );

  const handleCalendarToggleClick = useCallback(() => {
    if (disabled || isCalendarOpen) return;

    updateCalendarPosition();
    onToggleCalendar();
  }, [disabled, isCalendarOpen, onToggleCalendar, updateCalendarPosition]);

  const inputClasses = useMemo(
    () =>
      cn(
        'date-range-input outline-secondary-19 bg-custom-trigger text-primary-14 h-10 w-full rounded-lg px-3 py-3 pr-14 text-[11px] font-medium leading-4 focus-visible:outline-none',
        { 'cursor-not-allowed opacity-60': disabled },
        inputClassName
      ),
    [disabled, inputClassName]
  );

  const handleContainerPointerDown = useCallback(
    (target: HTMLElement) => {
      if (!isCalendarOpen) return;
      if (target.closest('[data-calendar-toggle="true"]')) return;
      onCloseCalendar();
    },
    [isCalendarOpen, onCloseCalendar]
  );

  const handleContainerPointerEvent = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      handleContainerPointerDown(event.target as HTMLElement);
    },
    [handleContainerPointerDown]
  );

  const stopPropagation = useCallback((event: React.SyntheticEvent) => {
    event.stopPropagation();
  }, []);

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
      signal: controller.signal
    });

    return () => {
      controller.abort();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isCalendarOpen, updateCalendarPosition]);

  const hasRange = value.startDate !== null || value.endDate !== null;
  const startInputValue = timestampToInputDate(value.startDate);
  const endInputValue = timestampToInputDate(value.endDate);
  const minInput = timestampToInputDate(min);
  const maxInput = timestampToInputDate(max);
  const sharedOverlayCalendarProps = {
    value,
    onChange,
    min,
    max,
    disabled,
    onCancel: handleCalendarCancel,
    onClose: handleCalendarClose
  };

  const renderInputs = () => (
    <div
      ref={anchorRef}
      className={cn(
        'bg-primary-15 relative mx-auto flex w-full max-w-[359px] flex-col items-stretch gap-3 rounded-lg p-4 shadow-[inset_0_0_0_0.25px_var(--secondary-39),0px_8px_16px_rgba(13,19,26,0.1),0px_16px_32px_rgba(13,19,26,0.05)] lg:mx-0 lg:w-[168px] lg:max-w-none lg:gap-2 lg:p-2',
        className,
        { 'z-[50]': isCalendarOpen }
      )}
      onPointerDown={handleContainerPointerEvent}
    >
      <div className='flex flex-col gap-0'>
        <View.Condition if={showLabels}>
          <div className='flex h-6 items-center rounded-lg px-3 py-1'>
            <Text
              size='11'
              weight='500'
              lineHeight='16'
              className='text-secondary-41 dark:text-secondary-33'
            >
              Start
            </Text>
          </div>
        </View.Condition>
        <div className='relative'>
          <input
            type='date'
            value={startInputValue}
            min={minInput}
            max={maxInput}
            onChange={onStartChange}
            disabled={disabled}
            onClick={handleInputClick}
            className={inputClasses}
          />
          <Button
            type='button'
            className='absolute top-1/2 right-3 z-10 h-6 w-6 -translate-y-1/2'
            onClick={handleCalendarToggleClick}
            disabled={disabled}
            aria-label='Open calendar'
            data-calendar-toggle='true'
          />
        </div>
      </div>
      <div className='flex flex-col gap-0'>
        <View.Condition if={showLabels}>
          <div className='flex h-6 items-center rounded-lg px-3 py-1'>
            <Text
              size='11'
              weight='500'
              lineHeight='16'
              className='text-secondary-41 dark:text-secondary-33'
            >
              End
            </Text>
          </div>
        </View.Condition>
        <div className='relative'>
          <input
            type='date'
            value={endInputValue}
            min={minInput}
            max={maxInput}
            onChange={onEndChange}
            disabled={disabled}
            onClick={handleInputClick}
            className={inputClasses}
          />
          <Button
            type='button'
            className='absolute top-1/2 right-3 z-10 h-6 w-6 -translate-y-1/2'
            onClick={handleCalendarToggleClick}
            disabled={disabled}
            aria-label='Open calendar'
            data-calendar-toggle='true'
          />
        </div>
      </div>
      {showClear && (
        <>
          <div className='-mx-4 h-[0.25px] w-[calc(100%+32px)] self-stretch bg-[var(--color-secondary-39)] lg:-mx-2 lg:w-[calc(100%+16px)]' />
          <Button
            className={cn(
              'text-primary-14 mt-0 h-[30px] w-full rounded-lg px-3 py-2 text-[11px] font-medium dark:hover:text-white',
              'bg-secondary-12 hover:bg-secondary-40',
              !hasRange && 'hover:bg-secondary-12 cursor-not-allowed opacity-50'
            )}
            onClick={onClear}
            disabled={disabled || !hasRange}
          >
            {clearLabel}
          </Button>
        </>
      )}
    </div>
  );

  const renderCalendarOverlay = () => (
    <Portal>
      <View.TabletMobile>
        <div
          className='shadow-15 fixed bottom-2 left-1/2 z-[60] w-[359px] max-w-[calc(100vw-16px)] -translate-x-1/2'
          onPointerDown={stopPropagation}
        >
          <Calendar
            variant='mobile'
            {...sharedOverlayCalendarProps}
          />
        </div>
      </View.TabletMobile>
      <View.Desktop>
        <div
          className='shadow-15 absolute top-0 left-0 z-[60]'
          style={{
            transform: `translate3d(${calendarTransform.left}px, ${calendarTransform.top}px, 0)`
          }}
          onPointerDown={stopPropagation}
        >
          <Calendar
            variant='desktop'
            {...sharedOverlayCalendarProps}
          />
        </div>
      </View.Desktop>
    </Portal>
  );

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
      {renderInputs()}
      <View.Condition if={isCalendarOpen}>
        {renderCalendarOverlay()}
      </View.Condition>
    </>
  );
};

const DateRangePickerPopover: FC<DateRangePickerPopoverProps> = ({
  placeholder = 'Date range',
  triggerClassName,
  popoverContentClassName,
  ...pickerProps
}) => {
  const { value, disabled = false } = pickerProps;
  const { isOpen, onOpenModal, onCloseModal } = useModal();
  const wasDesktopRef = useRef<boolean | null>(null);

  const hasSelection = value.startDate !== null || value.endDate !== null;

  const rangeLabel = useMemo(() => {
    if (value.startDate !== null && value.endDate !== null) {
      return `${formatTimestampForLabel(value.startDate)} - ${formatTimestampForLabel(value.endDate)}`;
    }
    if (value.startDate !== null) {
      return `${formatTimestampForLabel(value.startDate)} - ...`;
    }
    if (value.endDate !== null) {
      return `... - ${formatTimestampForLabel(value.endDate)}`;
    }
    return placeholder;
  }, [placeholder, value.endDate, value.startDate]);

  useEffect(() => {
    if (!isOpen) return;

    const mql = window.matchMedia(MEDIA_QUERY_DESKTOP);
    wasDesktopRef.current = mql.matches;

    const closeOnViewportTransition = () => {
      const isDesktop = mql.matches;
      const wasDesktop = wasDesktopRef.current;

      if (wasDesktop !== null && wasDesktop !== isDesktop) {
        onCloseModal();
      }

      wasDesktopRef.current = isDesktop;
    };

    mql.addEventListener('change', closeOnViewportTransition);

    return () => {
      mql.removeEventListener('change', closeOnViewportTransition);
    };
  }, [isOpen, onCloseModal]);

  const triggerClasses = cn(
    'bg-custom-trigger flex h-[32px] items-center gap-1.5 rounded-lg p-1.5 pr-3 text-[11px] font-medium',
    { 'opacity-60': disabled },
    triggerClassName
  );

  return (
    <div>
      <Dropdown
        open={isOpen}
        isDisabled={disabled}
        onOpen={onOpenModal}
        onClose={onCloseModal}
        triggerContent={
          <div className={triggerClasses}>
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
        }
        contentClassName={cn(
          'bg-transparent border-none p-0 shadow-none max-h-none overflow-visible z-[50]',
          'fixed left-1/2 bottom-2 top-auto w-[calc(100vw-16px)] max-w-[359px] -translate-x-1/2',
          'lg:absolute lg:left-auto lg:right-0 lg:bottom-auto lg:top-10 lg:w-auto lg:max-w-none lg:translate-x-0',
          popoverContentClassName
        )}
      >
        <DateRangePicker
          {...pickerProps}
          onClose={onCloseModal}
        />
      </Dropdown>
    </div>
  );
};

export { DateRangePickerPopover };
export default DateRangePicker;
