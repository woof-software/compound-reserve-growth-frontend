import { ReactElement, ReactNode } from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';

import { cn } from '@/shared/lib/classNames/classNames';

interface HoverCardProps {
  children: ReactElement;
  content: ReactNode;
  openDelay?: number;
  closeDelay?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
}

const HoverCard = ({
  children,
  content,
  openDelay = 200,
  closeDelay = 200,
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  className
}: HoverCardProps) => {
  return (
    <HoverCardPrimitive.Root
      openDelay={openDelay}
      closeDelay={closeDelay}
    >
      <HoverCardPrimitive.Trigger asChild>
        {children}
      </HoverCardPrimitive.Trigger>
      <HoverCardPrimitive.Portal>
        <HoverCardPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit rounded-lg px-4 py-2 text-[11px]',
            'text-primary-11 bg-[#ffffff] shadow-[0px_2px_9px_0px_#00000040,0px_8px_24px_0px_#00000040]',
            'dark:text-primary-19 dark:bg-[#232e3a] dark:shadow-[0px_2px_9px_0px_#00000040,0px_8px_24px_0px_#00000040]',
            className
          )}
          onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('[data-radix-hover-card-content]')) {
              e.preventDefault();
            }
          }}
        >
          {content}
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Portal>
    </HoverCardPrimitive.Root>
  );
};

export default HoverCard;
