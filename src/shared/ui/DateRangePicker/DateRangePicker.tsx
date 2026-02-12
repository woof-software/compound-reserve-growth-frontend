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
import Button from '@/shared/ui/Button/Button';
import { Dropdown } from '@/shared/ui/Dropdown/Dropdown';
import Icon from '@/shared/ui/Icon/Icon';
import Portal from '@/shared/ui/Portal/Portal';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

import RangeCalendar from './RangeCalendar';

export type DateRangeValue = {
  startDate: string;
  endDate: string;
};

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  showLabels?: boolean;
  showClear?: boolean;
  clearLabel?: string;
  /** Called when content wants to close the container (e.g. after Clear), same as in SortDrawer/Filter */
  onClose?: () => void;
}

interface DateRangePickerPopoverProps extends DateRangePickerProps {
  triggerClassName?: string;
  popoverContentClassName?: string;
  placeholder?: string;
}

const getRangeLabel = (value: DateRangeValue, placeholder: string) => {
  if (value.startDate && value.endDate) {
    return `${value.startDate} — ${value.endDate}`;
  }
  if (value.startDate) {
    return `From ${value.startDate}`;
  }
  if (value.endDate) {
    return `Until ${value.endDate}`;
  }
  return placeholder;
};

const DateRangePicker: FC<DateRangePickerProps> = ({
  value,
  onChange,
  min,
  max,
  disabled = false,
  className,
  inputClassName,
  showLabels = false,
  showClear = false,
  clearLabel = 'Clear Filter',
  onClose: onCloseContainer
}) => {
  const {
    isOpen: isCalendarOpen,
    onCloseModal: onCloseCalendar,
    onToggleModal: onToggleCalendar
  } = useModal();
  const anchorRef = useRef<HTMLDivElement>(null);
  const placementRef = useRef<'below' | 'above' | null>(null);
  const rafRef = useRef<number | null>(null);
  const [calendarTransform, setCalendarTransform] = useState({
    top: 0,
    left: 0,
    scale: 1
  });

  const updateCalendarPosition = useCallback((forcePlacement = false) => {
    if (!anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    const margin = 16;
    const offset = 8;
    const calendarWidth = 640;
    const calendarHeight = 420;
    const scaleWidth = (window.innerWidth - margin * 2) / calendarWidth;
    const scaleHeight = (window.innerHeight - margin * 2) / calendarHeight;
    const scale = Math.min(1, scaleWidth, scaleHeight);
    const scaledWidth = calendarWidth * scale;
    const scaledHeight = calendarHeight * scale;
    const spaceBelow = window.innerHeight - rect.bottom - offset - margin;
    const spaceAbove = rect.top - offset - margin;

    if (!placementRef.current || forcePlacement) {
      if (spaceBelow >= scaledHeight) {
        placementRef.current = 'below';
      } else if (spaceAbove >= scaledHeight) {
        placementRef.current = 'above';
      } else {
        placementRef.current = spaceBelow >= spaceAbove ? 'below' : 'above';
      }
    }

    let left = rect.left;
    let top =
      placementRef.current === 'above'
        ? rect.top - scaledHeight - offset
        : rect.bottom + offset;

    if (left + scaledWidth + margin > window.innerWidth) {
      left = window.innerWidth - scaledWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }
    if (top + scaledHeight + margin > window.innerHeight) {
      top = window.innerHeight - scaledHeight - margin;
    }
    if (top < margin) {
      top = margin;
    }

    setCalendarTransform((prev) => {
      const isSame =
        Math.abs(prev.top - top) < 0.5 &&
        Math.abs(prev.left - left) < 0.5 &&
        Math.abs(prev.scale - scale) < 0.001;
      return isSame ? prev : { top, left, scale };
    });
  }, []);
  const onStartChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const nextStart = e.target.value;
      onChange({ startDate: nextStart, endDate: value.endDate });
    },
    [onChange, value.endDate]
  );

  const onEndChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const nextEnd = e.target.value;
      onChange({ startDate: value.startDate, endDate: nextEnd });
    },
    [onChange, value.startDate]
  );

  const onClear = useCallback(() => {
    onChange({ startDate: '', endDate: '' });
    onCloseContainer?.();
  }, [onChange, onCloseContainer]);

  const handleInputClick = useCallback(
    (event: React.MouseEvent<HTMLInputElement>) => {
      if (disabled) return;
      event.preventDefault();
    },
    [disabled]
  );

  const handleCalendarToggleClick = useCallback(() => {
    if (disabled) return;

    if (!isCalendarOpen) {
      updateCalendarPosition(true);
      onToggleCalendar();
    }
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
      if (target.closest('[data-calendar-toggle="true"]')) {
        return;
      }
      onCloseCalendar();
    },
    [isCalendarOpen, onCloseCalendar]
  );

  useEffect(() => {
    if (!isCalendarOpen) return;

    const scheduleUpdate = (forcePlacement = false) => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateCalendarPosition(forcePlacement);
      });
    };

    scheduleUpdate(true);
    const handleResize = () => scheduleUpdate(true);
    const handleScroll = () => scheduleUpdate(false);

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      placementRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isCalendarOpen, updateCalendarPosition]);

  const renderInputs = () => (
    <div
      ref={anchorRef}
      className={cn(
        'bg-primary-15 relative flex w-[168px] flex-col items-stretch gap-2 rounded-lg p-2 shadow-[inset_0_0_0_0.25px_var(--secondary-39),0px_8px_16px_rgba(13,19,26,0.1),0px_16px_32px_rgba(13,19,26,0.05)]',
        className,
        { 'z-[50]': isCalendarOpen }
      )}
      onMouseDown={(event: React.MouseEvent<HTMLDivElement>) =>
        handleContainerPointerDown(event.target as HTMLElement)
      }
      onTouchStart={(event: React.TouchEvent<HTMLDivElement>) =>
        handleContainerPointerDown(event.target as HTMLElement)
      }
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
            value={value.startDate}
            min={min || undefined}
            max={max || undefined}
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
            value={value.endDate}
            min={min || undefined}
            max={max || undefined}
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
      <View.Condition
        if={Boolean(showClear && (value.startDate || value.endDate))}
      >
        <div className='-mx-2 h-[0.25px] w-[calc(100%+16px)] self-stretch bg-[var(--color-secondary-39)]' />
        <Button
          className='text-primary-14 hover:bg-secondary-22 hover:shadow-15 h-[30px] w-full rounded-lg px-3 text-[11px] leading-4 font-medium'
          onClick={onClear}
          disabled={disabled}
        >
          {clearLabel}
        </Button>
      </View.Condition>
    </div>
  );

  const renderCalendarOverlay = () => (
    <Portal>
      <div
        className='fixed inset-0 z-[40] bg-black/15 backdrop-blur-[2px] dark:bg-black/40'
        onMouseDown={() => {
          onCloseCalendar();
          onCloseContainer?.();
        }}
        onTouchStart={() => {
          onCloseCalendar();
          onCloseContainer?.();
        }}
      />
      <div
        className='shadow-15 fixed top-0 left-0 z-[60] will-change-transform'
        style={{
          transform: `translate3d(${calendarTransform.left}px, ${calendarTransform.top}px, 0) scale(${calendarTransform.scale})`,
          transformOrigin: 'top left'
        }}
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        <RangeCalendar
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          disabled={disabled}
        />
      </div>
    </Portal>
  );

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
  const hasSelection = Boolean(value.startDate || value.endDate);
  const iconName = hasSelection ? 'calendar-check' : 'calendar-uncheck';
  const rangeLabel = getRangeLabel(value, placeholder);

  const triggerClasses = cn(
    'bg-custom-trigger flex h-[32px] items-center gap-1.5 rounded-lg p-1.5 pr-3 text-[11px] font-medium',
    { 'opacity-60': disabled },
    triggerClassName
  );

  return (
    <div className={cn({ 'pointer-events-none': disabled })}>
      <Dropdown
        open={isOpen}
        onOpen={onOpenModal}
        onClose={onCloseModal}
        triggerContent={
          <Button
            className={triggerClasses}
            disabled={disabled}
          >
            <div className='p-0.5'>
              <Icon
                name={iconName}
                className='h-4 w-4'
                isRound={false}
              />
            </div>
            <Text
              size='11'
              weight='500'
              lineHeight='16'
              className={
                hasSelection
                  ? '!text-[var(--color-secondary-10)]'
                  : '!text-[var(--color-gray-11)]'
              }
            >
              {rangeLabel}
            </Text>
          </Button>
        }
        contentClassName={cn(
          'bg-transparent p-0 border-none shadow-none max-h-none overflow-visible !overflow-visible !z-[50]',
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
