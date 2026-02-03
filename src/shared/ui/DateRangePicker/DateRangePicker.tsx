import React, { ChangeEvent, FC, useEffect, useRef, useState } from 'react';

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
  triggerClassName?: string;
  popoverContentClassName?: string;
  showLabels?: boolean;
  showClear?: boolean;
  clearLabel?: string;
  placeholder?: string;
  variant?: 'inline' | 'popover';
}

const DateRangePicker: FC<DateRangePickerProps> = ({
  value,
  onChange,
  min,
  max,
  disabled = false,
  className,
  inputClassName,
  triggerClassName,
  popoverContentClassName,
  showLabels = false,
  showClear = false,
  clearLabel = 'Clear Filter',
  placeholder = 'Date range',
  variant = 'inline'
}) => {
  const {
    isOpen: isDropdownOpen,
    onOpenModal: onOpenDropdown,
    onCloseModal: onCloseDropdown
  } = useModal();
  const {
    isOpen: isCalendarOpen,
    onCloseModal: onCloseCalendar,
    onToggleModal: onToggleCalendar
  } = useModal();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [calendarTransform, setCalendarTransform] = useState({
    top: 0,
    left: 0,
    scale: 1
  });
  const onStartChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextStart = e.target.value;
    onChange({ startDate: nextStart, endDate: value.endDate });
  };

  const onEndChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextEnd = e.target.value;
    onChange({ startDate: value.startDate, endDate: nextEnd });
  };

  const onClear = () => onChange({ startDate: '', endDate: '' });

  const inputClasses = cn(
    'date-range-input outline-secondary-19 bg-custom-trigger text-primary-14 h-10 w-full rounded-lg px-3 pr-10 text-[11px] font-medium leading-4 focus-visible:outline-none',
    { 'cursor-not-allowed opacity-60': disabled },
    inputClassName
  );

  const rangeLabel = () => {
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

  const handleCloseDropdown = () => {
    onCloseDropdown();
    onCloseCalendar();
  };

  useEffect(() => {
    if (!isCalendarOpen) return;

    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      const margin = 16;
      const calendarWidth = 640;
      const calendarHeight = 380;
      const scaleWidth = (window.innerWidth - margin * 2) / calendarWidth;
      const scaleHeight = (window.innerHeight - margin * 2) / calendarHeight;
      const scale = Math.min(1, scaleWidth, scaleHeight);
      const scaledWidth = calendarWidth * scale;
      const scaledHeight = calendarHeight * scale;
      let left = rect.left;
      let top = rect.bottom + 8;

      if (left + scaledWidth + margin > window.innerWidth) {
        left = window.innerWidth - scaledWidth - margin;
      }
      if (left < margin) {
        left = margin;
      }
      if (top + scaledHeight + margin > window.innerHeight) {
        top = rect.top - scaledHeight - 8;
      }
      if (top < margin) {
        top = margin;
      }

      setCalendarTransform({ top, left, scale });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isCalendarOpen]);

  const renderInputs = () => (
    <div
      ref={anchorRef}
      className={cn(
        'bg-primary-15 relative flex w-[168px] flex-col items-stretch gap-2 rounded-lg p-2 shadow-[inset_0_0_0_0.25px_var(--secondary-39),0px_8px_16px_rgba(13,19,26,0.1),0px_16px_32px_rgba(13,19,26,0.05)]',
        className,
        { 'z-[50]': isCalendarOpen }
      )}
      onMouseDown={(event: React.MouseEvent<HTMLDivElement>) => {
        if (!isCalendarOpen) return;
        const target = event.target as HTMLElement;
        if (target.closest('[data-calendar-toggle="true"]')) {
          return;
        }
        onCloseCalendar();
      }}
      onTouchStart={(event: React.TouchEvent<HTMLDivElement>) => {
        if (!isCalendarOpen) return;
        const target = event.target as HTMLElement;
        if (target.closest('[data-calendar-toggle="true"]')) {
          return;
        }
        onCloseCalendar();
      }}
    >
      <div className='flex flex-col gap-0'>
        <View.Condition if={showLabels}>
          <div className='flex h-6 items-center rounded-lg px-3 py-1'>
            <Text
              size='11'
              weight='500'
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
            className={inputClasses}
          />
          <Button
            type='button'
            className='absolute top-1/2 right-3 z-10 h-6 w-6 -translate-y-1/2'
            onClick={onToggleCalendar}
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
            className={inputClasses}
          />
          <Button
            type='button'
            className='absolute top-1/2 right-3 z-10 h-6 w-6 -translate-y-1/2'
            onClick={onToggleCalendar}
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
          className='text-primary-14 hover:bg-secondary-22 hover:shadow-15 h-[30px] w-full rounded-lg text-[11px] font-medium'
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
        onMouseDown={onCloseCalendar}
        onTouchStart={onCloseCalendar}
      />
      <div
        className='shadow-15 fixed z-[60]'
        style={{
          top: `${calendarTransform.top}px`,
          left: `${calendarTransform.left}px`,
          transform: `scale(${calendarTransform.scale})`,
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

  if (variant === 'popover') {
    const hasSelection = Boolean(value.startDate || value.endDate);
    const iconName = hasSelection ? 'calendar-check' : 'calendar-uncheck';

    const triggerClasses = cn(
      'bg-custom-trigger flex h-[32px] items-center gap-1.5 rounded-lg p-1.5 pr-3 text-[11px] font-medium',
      { 'opacity-60': disabled },
      triggerClassName
    );

    return (
      <>
        <div className={cn({ 'pointer-events-none': disabled })}>
          <Dropdown
            open={isDropdownOpen}
            onOpen={onOpenDropdown}
            onClose={handleCloseDropdown}
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
                  className={
                    hasSelection
                      ? '!text-[var(--color-secondary-10)]'
                      : '!text-[var(--color-gray-11)]'
                  }
                >
                  {rangeLabel()}
                </Text>
              </Button>
            }
            contentClassName={cn(
              'bg-transparent p-0 border-none shadow-none max-h-none overflow-visible !overflow-visible !z-[50]',
              popoverContentClassName
            )}
          >
            {renderInputs()}
          </Dropdown>
        </div>
        <View.Condition if={isCalendarOpen}>
          {renderCalendarOverlay()}
        </View.Condition>
      </>
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

export default DateRangePicker;
