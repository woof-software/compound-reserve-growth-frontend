import React, { FC } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import Drawer from '@/shared/ui/Drawer/Drawer';
import {
  Dropdown,
  DropdownItem,
  TriggerContent
} from '@/shared/ui/Dropdown/Dropdown';
import Each from '@/shared/ui/Each/Each';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

import ArrowDown from '@/assets/svg/arrow-down.svg';
import CheckStroke from '@/assets/svg/check-stroke.svg';

interface SingleDropdownProps {
  options: string[];
  selectedValue?: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (value: string) => void;
  triggerContentClassName?: string;
  disabled?: boolean;
  contentClassName?: string;
}

const SingleDropdown: FC<SingleDropdownProps> = ({
  options,
  selectedValue,
  isOpen,
  triggerContentClassName,
  onToggle,
  onClose,
  onSelect,
  disabled,
  contentClassName
}) => {
  return (
    <>
      <div className='hidden lg:block'>
        <Dropdown
          isDisabled={disabled}
          triggerContent={
            <TriggerContent
              className={triggerContentClassName}
              title={selectedValue || options[0]}
              isOpen={isOpen}
            />
          }
          open={isOpen}
          onToggle={onToggle}
          onClose={onClose}
          contentClassName={contentClassName}
        >
          <Each
            data={options}
            render={(el, index) => (
              <DropdownItem
                key={index}
                asset={el}
                onSelect={onSelect}
                isSelected={selectedValue === el}
              />
            )}
          />
        </Dropdown>
      </div>
      <div className='lg:hidden'>
        <div
          className={cn(
            'hover:bg-secondary-11 flex items-center gap-1.5 rounded-sm px-[17px] py-1',
            triggerContentClassName,
            {
              'bg-secondary-11': isOpen
            }
          )}
          onClick={onToggle}
        >
          <Text
            size='11'
            weight='600'
            lineHeight='16'
          >
            {selectedValue || options[0]}
          </Text>
          <ArrowDown
            className={cn('transition-transform', {
              'rotate-180': isOpen
            })}
            width={20}
            height={20}
          />
        </div>
        <Drawer
          isOpen={isOpen}
          onClose={onClose}
        >
          <Text
            size='17'
            weight='700'
            lineHeight='140'
            align='center'
            className='mb-8 w-full'
          >
            Group By
          </Text>
          <Each
            data={options}
            render={(el, index) => (
              <div
                key={index}
                className='hover:bg-secondary-12 flex h-10 cursor-pointer items-center justify-between rounded-lg py-3'
                onClick={() => {
                  onSelect(el);
                }}
              >
                <Text
                  size='14'
                  weight='500'
                  lineHeight='16'
                >
                  {el}
                </Text>
                <View.Condition if={selectedValue === el}>
                  <CheckStroke
                    width={16}
                    height={16}
                  />
                </View.Condition>
              </div>
            )}
          />
        </Drawer>
      </div>
    </>
  );
};

export default SingleDropdown;
