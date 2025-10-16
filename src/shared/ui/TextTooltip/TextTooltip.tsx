import React from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import Text from '@/shared/ui/Text/Text';

import HoverCard from '../../../components/HoverCard/HoverCard';

interface TextTooltipProps {
  text: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  triggerWidth?: number;
  className?: {
    triggerContent?: string;
    tooltip?: string;
    text?: string;
  };
}

export const TextTooltip: React.FC<TextTooltipProps> = ({
  text,
  side = 'top',
  triggerWidth = 120,
  className
}) => {
  const triggerContent = (
    <div
      className={cn('flex items-start', className?.triggerContent)}
      style={{ width: `${triggerWidth}px` }}
    >
      <Text
        size='13'
        className={cn(
          'text-primary-11 inline-block max-w-full cursor-pointer truncate leading-none',
          className?.text
        )}
      >
        {text}
      </Text>
    </div>
  );

  const tooltipContent = (
    <div className='max-w-xs'>
      <Text
        size='12'
        className={cn('text-primary-11', className?.text)}
      >
        {text}
      </Text>
    </div>
  );

  return (
    <HoverCard
      content={tooltipContent}
      side={side}
      className={className?.tooltip}
    >
      {triggerContent}
    </HoverCard>
  );
};
