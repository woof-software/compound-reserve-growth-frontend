import {
  FC,
  PropsWithChildren,
  ReactNode,
  RefObject,
  useRef,
  useState
} from 'react';
import * as React from 'react';

import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { cn } from '@/shared/lib/classNames/classNames';
import { preventEventBubbling } from '@/shared/lib/utils/utils';
import Each from '@/shared/ui/Each/Each';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/ui/Popover/Popover';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

import ArrowDown from '@/assets/svg/arrow-down.svg';
import CheckStroke from '@/assets/svg/check-stroke.svg';
import CloseIcon from '@/assets/svg/close.svg';

interface SelectProps extends PropsWithChildren {
  open: boolean;

  title: string;

  triggerContent: ReactNode;

  onToggle: () => void;

  onClose: () => void;
}

interface SelectItemProps {
  asset: string;

  isSelected?: boolean;

  onSelect: (value: string) => void;
}

interface SelectTriggerContentProps {
  placeholder: string;

  selectedItems: string[];

  maximumItems?: number;

  onItemDelete: (index: number) => void;
}

const Select: FC<SelectProps> = ({
  triggerContent,
  title,
  open,
  children,
  onToggle,
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef as RefObject<HTMLDivElement>, onClose);

  return (
    <div
      ref={containerRef}
      className='w-full max-w-[536px] data-[radix-popper-content-wrapper]:w-full'
    >
      <Popover open={open}>
        <PopoverTrigger
          className='bg-primary-15 outline-secondary-13 relative min-h-[48px] w-full max-w-[536px] cursor-pointer rounded-lg px-5 py-[13px] outline outline-solid'
          onClick={onToggle}
        >
          <Text
            size='11'
            weight='500'
            lineHeight='16'
            className='text-primary-14 bg-primary-15 absolute -top-[9px] px-1'
          >
            {title}
          </Text>

          <div className='flex items-center justify-between'>
            {triggerContent}

            <ArrowDown
              className={cn('transition-transform', {
                'rotate-180': open
              })}
              width={20}
              height={20}
            />
          </div>
        </PopoverTrigger>

        <PopoverContent className='hide-scrollbar outline-secondary-13 bg-primary-15 grid max-h-[182px] w-[536px] gap-0.5 overflow-y-auto border-none p-2 outline outline-solid'>
          {children}
        </PopoverContent>
      </Popover>
    </div>
  );
};

const SelectItem: FC<SelectItemProps> = ({
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

const SelectTriggerContent: FC<SelectTriggerContentProps> = ({
  placeholder,
  selectedItems,
  maximumItems = 3,
  onItemDelete
}) => {
  return (
    <div className='flex items-center gap-1.5'>
      <View.Condition if={Boolean(selectedItems.length)}>
        <Each
          data={selectedItems.slice(0, maximumItems)}
          render={(el, index) => (
            <div
              key={index}
              className='bg-secondary-14 flex items-center gap-1.5 rounded-sm px-2 py-1'
              onClick={(e) => {
                preventEventBubbling(e);

                onItemDelete(index);
              }}
            >
              <Text
                tag='span'
                size='11'
                weight='500'
                lineHeight='14'
              >
                {el}
              </Text>

              <CloseIcon
                width='8.5px'
                height='8.5px'
                className='text-secondary-15 fill-current'
              />
            </div>
          )}
        />

        <View.Condition if={Boolean(selectedItems.length > maximumItems)}>
          <div className='bg-secondary-14 flex min-w-[65px] gap-0.5 rounded-sm px-2 py-1'>
            <Text
              tag='span'
              size='11'
              weight='500'
              lineHeight='16'
            >
              +{selectedItems.length - 3} others
            </Text>
          </div>
        </View.Condition>
      </View.Condition>

      <Text
        tag='span'
        size='11'
        weight='500'
        lineHeight='14'
      >
        {placeholder}
      </Text>
    </div>
  );
};

const useSelect = (type: 'single' | 'multiple' = 'multiple') => {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string[]>([]);

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  const select = (value: string) => {
    if (type === 'single') {
      setSelectedValue([value]);
      setOpen(false);
    } else {
      setSelectedValue((prev) =>
        prev?.includes(value)
          ? prev?.filter((v) => v !== value)
          : [...(prev || []), value]
      );
    }
  };

  const deleteItem = (index: number) => {
    if (type === 'multiple' && selectedValue) {
      setSelectedValue(selectedValue.filter((_, i) => i !== index));
    }
  };

  return {
    open,
    selectedValue,
    toggle,
    close,
    select,
    deleteItem
  };
};

export { Select, SelectItem, SelectTriggerContent, useSelect };
