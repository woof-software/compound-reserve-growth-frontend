import React from 'react';

import Text from '@/shared/ui/Text/Text';

import HoverCard from '../../../components/HoverCard/HoverCard';

interface TextTooltipProps {
  text: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  triggerWidth?: number;
  className?: string;
  tooltipClassName?: string;
}

export const TextTooltip: React.FC<TextTooltipProps> = ({
  text,
  side = 'top',
  triggerWidth = 120,
  className = '',
  tooltipClassName = ''
}) => {
  const triggerContent = (
    <div
      className={`flex items-start ${className}`}
      style={{ width: `${triggerWidth}px` }}
    >
      <Text
        size='13'
        className='text-primary-11 inline-block max-w-full cursor-pointer truncate leading-none'
      >
        {text}
      </Text>
    </div>
  );

  const tooltipContent = (
    <div className='max-w-xs'>
      <Text
        size='12'
        className='text-primary-11'
      >
        {text}
      </Text>
    </div>
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
