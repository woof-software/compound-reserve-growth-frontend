import React, { FC, useMemo } from 'react';

import { cn } from '@/shared/lib/classNames';
import { HoverCard, Text } from '@/shared/ui/atoms';

type SideType = 'top' | 'bottom' | 'left' | 'right';

interface TextTooltipProps {
  text: string;
  side?: SideType;
  triggerWidth?: number;
  className?: string;
  tooltipClassName?: string;
}

const TextTooltip: FC<TextTooltipProps> = ({
  text,
  side = 'top',
  triggerWidth = 120,
  className = '',
  tooltipClassName = ''
}) => {
  const triggerContent = useMemo(
    () => (
      <div
        className={cn('flex items-start', className)}
        style={{ width: `${triggerWidth}px` }}
      >
        <Text
          size='13'
          className='text-primary-11 inline-block max-w-full cursor-pointer truncate leading-none'
        >
          {text}
        </Text>
      </div>
    ),
    [className, triggerWidth, text]
  );

  const tooltipContent = useMemo(
    () => (
      <div className='max-w-xs'>
        <Text
          size='12'
          className='text-primary-11'
        >
          {text}
        </Text>
      </div>
    ),
    [text]
  );

  return (
    <HoverCard
      content={tooltipContent}
      side={side}
      className={tooltipClassName}
    >
      {triggerContent}
    </HoverCard>
  );
};

export { TextTooltip };
