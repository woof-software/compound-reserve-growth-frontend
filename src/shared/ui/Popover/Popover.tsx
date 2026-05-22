import * as React from 'react';
import { forwardRef } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/shared/lib/classNames/classNames';

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return (
    <PopoverPrimitive.Root
      data-slot='popover'
      {...props}
    />
  );
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger
      data-slot='popover-trigger'
      {...props}
    />
  );
}

const PopoverContent = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal data-slot='popover-portal'>
    <PopoverPrimitive.Content
      ref={ref}
      data-slot='popover-content'
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-hidden',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));

export { Popover, PopoverContent, PopoverTrigger };
