import { FC, memo, RefObject, useRef } from 'react';
import * as React from 'react';

import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { useModal } from '@/shared/hooks/useModal';
import { cn } from '@/shared/lib/classNames/classNames';
import {
  capitalizeFirstLetter,
  preventEventBubbling
} from '@/shared/lib/utils/utils';
import Each from '@/shared/ui/Each/Each';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

import ArrowDown from '@/shared/assets/svg/arrow-down.svg';
import CheckStroke from '@/shared/assets/svg/check-stroke.svg';
import CloseIcon from '@/shared/assets/svg/close.svg';

interface SelectProps {
  filterId: string;

  title: string;

  placeholder: string;

  selectedItems: string[];

  options: string[];

  maximumItems?: number;

  onItemDelete: (filterId: string, item: string) => void;

  onItemSelect: (filterId: string, item: string) => void;
}

interface SelectItemProps {
  asset: string;

  isSelected?: boolean;

  onSelect: () => void;
}

interface SelectTriggerContentProps {
  filterId: string;

  placeholder: string;

  selectedItems: string[];

  maximumItems?: number;

  onItemDelete: (filterId: string, item: string) => void;
}

const Select: FC<SelectProps> = memo(
  ({
    filterId,
    title,
    placeholder,
    options = [],
    selectedItems = [],
    maximumItems = 3,
    onItemDelete,
    onItemSelect
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const { isOpen, onCloseModal, onToggleModal } = useModal();

    const onSelectItemClick = (filterId: string, item: string) => {
      onItemSelect(filterId, item);
      onCloseModal();
    };

    useClickOutside(containerRef as RefObject<HTMLDivElement>, onCloseModal);

    return (
      <div
        ref={containerRef}
        className='relative w-full max-w-[536px] data-[radix-popper-content-wrapper]:w-full'
      >
        <div
          className='bg-primary-15 outline-secondary-13 relative min-h-[48px] w-full max-w-[536px] cursor-pointer rounded-lg px-5 py-[13px] outline outline-solid'
          onClick={onToggleModal}
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
            <SelectTriggerContent
              filterId={filterId}
              placeholder={placeholder}
              maximumItems={maximumItems}
              selectedItems={selectedItems}
              onItemDelete={onItemDelete}
            />
            <ArrowDown
              className={cn('transition-transform', {
                'rotate-180': isOpen
              })}
              width={20}
              height={20}
            />
          </div>
        </div>
        <View.Condition if={isOpen}>
          <div className='hide-scrollbar outline-secondary-13 bg-primary-15 hide-scrollbar absolute top-[52px] right-[-2px] z-10 grid max-h-[234px] w-[540px] gap-0.5 overflow-y-auto rounded-lg border-none p-2 outline outline-solid'>
            <Each
              data={options}
              render={(el, index) => {
                const isSelected = selectedItems.some((item) =>
                  item.includes(el)
                );

                return (
                  <SelectItem
                    key={index}
                    asset={el}
                    isSelected={isSelected}
                    onSelect={() => onSelectItemClick(filterId, el)}
                  />
                );
              }}
            />
          </div>
        </View.Condition>
      </div>
    );
  }
);

const SelectItem: FC<SelectItemProps> = memo(
  ({ asset, isSelected = false, onSelect }) => {
    return (
      <div
        className={cn(
          'hover:bg-secondary-12 flex h-10 cursor-pointer items-center justify-between rounded-lg p-3',
          {
            'bg-secondary-12': isSelected
          }
        )}
        onClick={onSelect}
      >
        <Text
          size='11'
          weight='500'
          lineHeight='16'
        >
          {capitalizeFirstLetter(asset)}
        </Text>
        <View.Condition if={isSelected}>
          <CheckStroke
            width={16}
            height={16}
          />
        </View.Condition>
      </div>
    );
  }
);

const SelectTriggerContent: FC<SelectTriggerContentProps> = memo(
  ({
    filterId,
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

                  onItemDelete(filterId, el);
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
  }
);

export { Select };
