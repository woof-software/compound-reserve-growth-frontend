import * as React from 'react';
import { ComponentProps } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '@/shared/lib';

import Text from '../Text/Text';
import View from '../View/View';

interface SwitchProps extends ComponentProps<typeof SwitchPrimitive.Root> {
  label?: string;

  positionLabel?: 'left' | 'right';
}

function Switch({ className, label, positionLabel, ...props }: SwitchProps) {
  return (
    <div className='flex items-center gap-3'>
      <View.Condition if={Boolean(label && positionLabel === 'left')}>
        <Text
          size='xxs'
          weight='medium'
          lineHeight='140'
          className='text-primary-14'
        >
          {label}
        </Text>
      </View.Condition>

      <SwitchPrimitive.Root
        data-slot='switch'
        className={cn(
          'peer data-[state=checked]:bg-success-10 data-[state=unchecked]:bg-primary-13 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-xl border border-transparent p-0.5 transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          data-slot='switch-thumb'
          className={cn(
            'bg-white-10 pointer-events-none block size-5 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0'
          )}
        />
      </SwitchPrimitive.Root>

      <View.Condition if={Boolean(label && positionLabel === 'right')}>
        <Text
          size='xxs'
          weight='medium'
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
