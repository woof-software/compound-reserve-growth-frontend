import * as React from 'react';
import { ComponentProps } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '@/shared/lib/classNames/classNames';

import Text from '../Text/Text';
import View from '../View/View';

interface SwitchProps
  extends Omit<ComponentProps<typeof SwitchPrimitive.Root>, 'className'> {
  label?: string;

  positionLabel?: 'left' | 'right';

  className?: {
    container?: string;

    block?: string;

    title?: string;

    thumb?: string;
  };
}

function Switch({ className, label, positionLabel, ...props }: SwitchProps) {
  return (
    <div
      className={cn('flex shrink-0 items-center gap-3', className?.container)}
    >
      <View.Condition if={Boolean(label && positionLabel === 'left')}>
        <Text
          size='14'
          weight='500'
          lineHeight='140'
          className={cn('text-primary-14', className?.title)}
        >
          {label}
        </Text>
      </View.Condition>
      <SwitchPrimitive.Root
        data-slot='switch'
        className={cn(
          'peer data-[state=checked]:bg-success-10 data-[state=unchecked]:bg-secondary-44 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-xl border border-transparent p-0.5 transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
          className?.block
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          data-slot='switch-thumb'
          className={cn(
            'bg-primary-15 pointer-events-none block size-5 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=checked]:bg-white data-[state=unchecked]:translate-x-0',
            className?.thumb
          )}
        />
      </SwitchPrimitive.Root>
      <View.Condition if={Boolean(label && positionLabel === 'right')}>
        <Text
          size='14'
          weight='500'
          lineHeight='140'
          className={cn('text-primary-14', className?.title)}
        >
          {label}
        </Text>
      </View.Condition>
    </div>
  );
}

export default Switch;
