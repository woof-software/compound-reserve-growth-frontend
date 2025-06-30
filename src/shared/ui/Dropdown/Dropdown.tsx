import * as React from 'react';
import {
  FC,
  PropsWithChildren,
  ReactNode,
  RefObject,
  useRef,
  useState
} from 'react';

import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { cn } from '@/shared/lib/classNames/classNames';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

import ArrowDown from '@/assets/svg/arrow-down.svg';
import CheckStroke from '@/assets/svg/check-stroke.svg';

interface DropdownProps extends PropsWithChildren {
  triggerContent: ReactNode;

  open: boolean;

  onToggle: () => void;

  onClose: () => void;
}

interface DropdownItemProps {
  asset: string;

  isSelected?: boolean;

  onSelect: (value: string) => void;
}

interface TriggerContentProps {
  title: string;

  isOpen: boolean;

  className?: string;
}

const useDropdown = (type: 'single' | 'multiple') => {
  const [open, setOpen] = useState(false);

  const [selectedValue, setSelectedValue] = useState<string[] | null>(null);

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  const select = (value: string) => {
    if (type === 'single') {
      setSelectedValue([value]);

      setOpen(false);
    } else {
      const newValues = selectedValue?.includes(value)
        ? selectedValue?.filter((v) => v !== value)
        : [...(selectedValue || []), value];

      setSelectedValue(newValues);
    }
  };

  return {
    open,
    selectedValue,
    toggle,
    close,
    select
  };
};

const Dropdown: FC<DropdownProps> = ({
  open,
  onToggle,
  onClose,
  triggerContent,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef as RefObject<HTMLDivElement>, onClose);

  return (
    <div
      className='relative z-10 w-fit'
      ref={containerRef}
    >
      <div>
        <div
          className='cursor-pointer'
          onClick={onToggle}
        >
          {triggerContent}
        </div>

        <View.Condition if={open}>
          <div className='hide-scrollbar shadow-10 border-secondary-18 bg-primary-15 absolute top-10 right-0 grid max-h-[182px] min-w-[168px] gap-0.5 overflow-y-auto rounded-lg border border-solid p-2'>
            {children}
          </div>
        </View.Condition>
      </div>
    </div>
  );
};

const DropdownItem: FC<DropdownItemProps> = ({
  asset,
  isSelected = false,
  onSelect
}) => {
  return (
    <div
      className={cn(
        'hover:bg-secondary-12 flex h-10 cursor-pointer items-center justify-between rounded-lg p-3',
        {
          'bg-secondary-12': isSelected
        }
      )}
      onClick={() => onSelect(asset)}
    >
      <Text
        size='11'
        weight='500'
        lineHeight='16'
      >
        {asset}
      </Text>

      <View.Condition if={isSelected}>
        <CheckStroke
          width={16}
          height={16}
        />
      </View.Condition>
    </div>
  );
};

const TriggerContent: FC<TriggerContentProps> = ({
  title,
  isOpen,
  className
}) => {
  return (
    <div
      className={cn(
        'hover:bg-secondary-11 flex items-center gap-1.5 rounded-sm px-[17px] py-2',
        className,
        {
          'bg-secondary-11': isOpen
        }
      )}
    >
      <Text
        size='11'
        weight='600'
        lineHeight='16'
      >
        {title}
      </Text>

      <ArrowDown
        className={cn('transition-transform', {
          'rotate-180': isOpen
        })}
        width={20}
        height={20}
      />
    </div>
  );
};

export { Dropdown, DropdownItem, TriggerContent, useDropdown };
