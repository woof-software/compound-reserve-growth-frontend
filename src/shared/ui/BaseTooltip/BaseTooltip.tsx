import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '../../lib/classNames/classNames';

export const TooltipProvider = ({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) => {
  return (
    <TooltipPrimitive.Provider
      data-slot='tooltip-provider'
      delayDuration={delayDuration}
      {...props}
    />
  );
};

export const Tooltip = ({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) => {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root
        data-slot='tooltip'
        {...props}
      />
    </TooltipProvider>
  );
};

export const TooltipTrigger = ({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) => {
  return (
    <TooltipPrimitive.Trigger
      data-slot='tooltip-trigger'
      {...props}
    />
  );
};

export const TooltipContent = ({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) => {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot='tooltip-content'
        sideOffset={sideOffset}
        className={cn(
          'bg-primary-15 text-primary-14 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit rounded-lg px-4 py-2 text-[11px] shadow-[0px_2px_9px_0px_#00000040]',
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
};
