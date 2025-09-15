import React, { FC, useMemo } from 'react';

import { cn } from '@/shared/lib/classNames';
import { HoverCard, Icon, Text, View } from '@/shared/ui/atoms';

type SideType = 'top' | 'bottom' | 'left' | 'right';

interface AddressTooltipProps {
  text: string;
  side?: SideType;
  triggerWidth?: number;
  className?: string;
  url?: string;
  tooltipClassName?: string;
  contentWidth?: string;
}

const UrlTooltip: FC<AddressTooltipProps> = ({
  text,
  side = 'top',
  triggerWidth = 120,
  className = '',
  url,
  tooltipClassName = '',
  contentWidth = 'w-40'
}) => {
  const triggerContent = useMemo(
    () => (
      <div
        className={cn('flex items-start', className)}
        style={{ width: `${triggerWidth}px` }}
      >
        <Text
          size='13'
          className='text-primary-11 inline-block max-w-full cursor-pointer truncate border-b border-dotted border-gray-500 leading-none'
        >
          {text}
        </Text>
      </div>
    ),
    [triggerWidth, className, text]
  );

  const tooltipContent = useMemo(
    () => (
      <div className={`flex ${contentWidth} flex-col items-start gap-2`}>
        <Text
          size='12'
          className='text-primary-11'
        >
          {text}
        </Text>
        <View.Condition if={Boolean(url)}>
          <div className='flex w-full items-center justify-between'>
            <Text
              size='12'
              className='text-primary-11'
            >
              View Proposal
            </Text>
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary-11 flex h-4 w-4 items-center justify-center'
            >
              <Icon
                name={'arrow-link'}
                className='h-4.5 w-3 text-[#7A8A99]'
              />
            </a>
          </div>
        </View.Condition>
      </div>
    ),
    [text, url, contentWidth]
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

export { UrlTooltip };
