import React from 'react';

import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { cn } from '@/shared/lib/classNames/classNames';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

import ArrowDown from '@/shared/assets/svg/arrow-down.svg';

export interface DropdownGroupFilterTriggerProps {
  onClick?: () => void;
  label?: string;
  triggerLabel?: string;
  isOpen?: boolean;
}

export const DropdownGroupFilterTrigger = (props: DropdownGroupFilterTriggerProps) => {
  const { label, onClick, isOpen = false, triggerLabel = 'Group by' } = props;

  const isMobile = useMediaQuery('(max-width: 63.938rem)');
  const hasSelectedValue = !!label;

  if (isMobile) {
    return (
      <button
        onClick={onClick}
        className={'flex w-full items-center cursor-pointer justify-between px-3 py-2.5 h-[42px] mb-3'}
      >
        <div className={'flex items-center gap-1.5'}>
          <Icon
            name='plus'
            className='h-2.5 w-2.5'
            color={cn('primary-14', {
              'primary-13': hasSelectedValue,
            })}
          />
          <Text
            size='14'
            weight='500'
            className={hasSelectedValue ? 'text-secondary-10' : 'text-primary-13'}
          >
            {triggerLabel}
          </Text>
        </div>
        {hasSelectedValue && (
          <div className={cn('flex h-6 w-auto items-center justify-center rounded-sm bg-secondary-46 px-2')}>
            <Text size='11' weight='500' className='text-primary-18'>
              {label}
            </Text>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className={'flex items-center gap-1.5 cursor-pointer'}>
      <Text
        tag='span'
        size='11'
        weight='600'
        lineHeight='16'
        className='text-primary-14'
      >
        {triggerLabel}
      </Text>
      <button
        className={cn('flex items-center rounded-lg pl-3 pr-1 h-8 hover:bg-primary-18 cursor-pointer gap-1.5', {
          'bg-primary-18': isOpen,
        })}
        onClick={onClick}
      >
        <Text
          tag='span'
          size='11'
          weight='600'
          lineHeight='16'
          className='text-secondary-10'
        >
          { label || 'None' }
        </Text>
        <ArrowDown
          className={cn('transition-transform', {
            'rotate-180': isOpen,
          })}
          width={20}
          height={20}
        />
      </button>
    </div>
  );
};