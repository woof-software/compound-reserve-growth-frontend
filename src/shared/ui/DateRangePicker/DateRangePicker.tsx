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

import { MEDIA_QUERY_DESKTOP } from '@/shared/lib/viewport/viewport';

import { CALENDAR_DESKTOP } from './constants';
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
  onClose?: () => void;
  inlineCalendar?: boolean;
}

interface DateRangePickerPopoverProps extends DateRangePickerProps {
  triggerClassName?: string;
  popoverContentClassName?: string;
  placeholder?: string;
}

function getRangeLabel(value: DateRangeValue, placeholder: string): string {
  if (value.startDate && value.endDate) {
    return `${value.startDate} — ${value.endDate}`;
  }
  if (value.startDate) return `From ${value.startDate}`;
  if (value.endDate) return `Until ${value.endDate}`;
  return placeholder;
}

const subscribeToMediaQuery = (
  mql: MediaQueryList,
  listener: () => void
): (() => void) => {
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }

  mql.addListener(listener);
  return () => mql.removeListener(listener);
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
  const isCalendarOpenRef = useRef(isCalendarOpen);
  const isDesktopRef = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia(MEDIA_QUERY_DESKTOP).matches
  );

  isCalendarOpenRef.current = isCalendarOpen;

  const [calendarTransform, setCalendarTransform] = useState({
    top: 0,
    left: 0,
    scale: 1
  });

  const updateCalendarPosition = useCallback(() => {
    if (!anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    const {
      WIDTH: calendarWidth,
      HEIGHT: calendarHeight,
      MARGIN,
      OFFSET_Y
    } = CALENDAR_DESKTOP;
    const scaleWidth = (window.innerWidth - MARGIN * 2) / calendarWidth;
    const scaleHeight = (window.innerHeight - MARGIN * 2) / calendarHeight;
    const scale = Math.min(1, scaleWidth, scaleHeight);
    const scaledWidth = calendarWidth * scale;

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let left = rect.left + scrollX;
    const top = rect.bottom + OFFSET_Y + scrollY;

    if (left + scaledWidth + MARGIN > scrollX + window.innerWidth) {
      left = scrollX + window.innerWidth - scaledWidth - MARGIN;
    }
    if (left < scrollX + MARGIN) {
      left = scrollX + MARGIN;
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
      updateCalendarPosition();
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

    const scheduleUpdate = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateCalendarPosition();
      });
    };

    scheduleUpdate();
    const handleResize = () => scheduleUpdate();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [
    isCalendarOpen,
    updateCalendarPosition,
    value.startDate,
    value.endDate,
    showClear
  ]);

  useEffect(() => {
    const mql =
      typeof window !== 'undefined'
        ? window.matchMedia(MEDIA_QUERY_DESKTOP)
        : null;
    if (!mql) return;

    const checkViewportAndClose = () => {
      const isDesktop = mql.matches;
      const wasDesktop = isDesktopRef.current;
      if (wasDesktop !== isDesktop && isCalendarOpenRef.current) {
        onCloseCalendar();
      }
      isDesktopRef.current = isDesktop;
    };

    isDesktopRef.current = mql.matches;
    const unsubscribe = subscribeToMediaQuery(mql, checkViewportAndClose);
    window.addEventListener('resize', checkViewportAndClose);
    return () => {
      unsubscribe();
      window.removeEventListener('resize', checkViewportAndClose);
    };
  }, [onCloseCalendar]);

  const hasRange = Boolean(value.startDate || value.endDate);

  const renderInputs = () => (
    <div
      ref={anchorRef}
      className={cn(
        'bg-primary-15 relative mx-auto flex w-full max-w-[359px] flex-col items-stretch gap-3 rounded-lg p-4 shadow-[inset_0_0_0_0.25px_var(--secondary-39),0px_8px_16px_rgba(13,19,26,0.1),0px_16px_32px_rgba(13,19,26,0.05)] lg:mx-0 lg:w-[168px] lg:max-w-none lg:gap-2 lg:p-2',
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
      {showClear && hasRange && (
        <>
          <div className='-mx-4 h-[0.25px] w-[calc(100%+32px)] self-stretch bg-[var(--color-secondary-39)] lg:-mx-2 lg:w-[calc(100%+16px)]' />
          <Button
            className={cn(
              'text-primary-14 mt-0 h-[30px] w-full rounded-lg px-3 py-2 text-[11px] font-medium dark:hover:text-white',
              'bg-secondary-12 hover:bg-secondary-40'
            )}
            onClick={onClear}
            disabled={disabled}
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
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
        >
          <RangeCalendar
            variant='mobile'
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            disabled={disabled}
            onCancel={() => {
              onChange({ startDate: '', endDate: '' });
            }}
            onClose={() => {
              onCloseCalendar();
              onCloseContainer?.();
            }}
          />
        </div>
      </View.TabletMobile>
      <View.Desktop>
        <div
          className='shadow-15 absolute top-0 left-0 z-[60] will-change-transform'
          style={{
            transform: `translate3d(${calendarTransform.left}px, ${calendarTransform.top}px, 0) scale(${calendarTransform.scale})`,
            transformOrigin: 'top left'
          }}
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
        >
          <RangeCalendar
            variant='desktop'
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            disabled={disabled}
            onCancel={() => {
              onChange({ startDate: '', endDate: '' });
            }}
            onClose={() => {
              onCloseCalendar();
              onCloseContainer?.();
            }}
          />
        </div>
      </View.Desktop>
    </Portal>
  );

  if (inlineCalendar) {
    return (
      <RangeCalendar
        variant='mobile'
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        disabled={disabled}
        className={className}
        onCancel={() => {
          onChange({ startDate: '', endDate: '' });
        }}
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
  const hasSelection = Boolean(value.startDate || value.endDate);
  const iconName = hasSelection ? 'calendar-check' : 'calendar-uncheck';
  const rangeLabel = getRangeLabel(value, placeholder);
  const iconColor = hasSelection ? 'secondary-10' : 'color-gray-11';
  const isDesktopRef = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia(MEDIA_QUERY_DESKTOP).matches
  );

  useEffect(() => {
    const mql =
      typeof window !== 'undefined'
        ? window.matchMedia(MEDIA_QUERY_DESKTOP)
        : null;
    if (!mql) return;

    const checkViewportAndClose = () => {
      const isDesktop = mql.matches;
      const wasDesktop = isDesktopRef.current;
      if (wasDesktop !== isDesktop && isOpen) {
        onCloseModal();
      }
      isDesktopRef.current = isDesktop;
    };

    isDesktopRef.current = mql.matches;
    const unsubscribe = subscribeToMediaQuery(mql, checkViewportAndClose);
    window.addEventListener('resize', checkViewportAndClose);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', checkViewportAndClose);
    };
  }, [isOpen, onCloseModal]);

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
                color={iconColor}
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
          '!fixed !left-1/2 !bottom-2 !top-auto !w-[calc(100vw-16px)] !max-w-[359px] !-translate-x-1/2',
          'lg:!absolute lg:!left-auto lg:!right-0 lg:!bottom-auto lg:!top-10 lg:!w-auto lg:!max-w-none lg:!translate-x-0',
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
