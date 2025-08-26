import * as React from 'react';
import { ComponentProps } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '@/shared/lib/classNames/classNames';

import Text from '../Text/Text';
import View from '../View/View';

interface SwitchProps extends ComponentProps<typeof SwitchPrimitive.Root> {
  label?: string;
  classNameTitle?: string;
  positionLabel?: 'left' | 'right';
  thumbClassName?: string;
}

function Switch({
  className,
  classNameTitle,
  label,
  positionLabel,
  thumbClassName,
  ...props
}: SwitchProps) {
  return (
    <div className='flex items-center gap-3'>
      <View.Condition if={Boolean(label && positionLabel === 'left')}>
        <Text
          size='14'
          weight='500'
          lineHeight='140'
          className={cn('text-primary-14', classNameTitle)}
        >
          {label}
        </Text>
      </View.Condition>
      <SwitchPrimitive.Root
        data-slot='switch'
        className={cn(
          'peer data-[state=checked]:bg-success-10 data-[state=unchecked]:bg-secondary-44 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-xl border border-transparent p-0.5 transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          data-slot='switch-thumb'
          className={cn(
            'bg-primary-15 pointer-events-none block size-5 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0',
            thumbClassName
          )}
        />
      </SwitchPrimitive.Root>
      <View.Condition if={Boolean(label && positionLabel === 'right')}>
        <Text
          size='14'
          weight='500'
          lineHeight='140'
          className='text-primary-14'
        >
          {label}
        </Text>
      </View.Condition>
    </div>
  );
}

export default Switch;
