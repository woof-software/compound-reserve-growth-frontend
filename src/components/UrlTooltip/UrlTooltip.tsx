import React from 'react';

import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

import HoverCard from '../HoverCard/HoverCard';

interface AddressTooltipProps {
  text: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  triggerWidth?: number;
  className?: string;
  url?: string;
  tooltipClassName?: string;
  contentWidth?: string;
  isRedirectContent?: boolean;
}

export const UrlTooltip: React.FC<AddressTooltipProps> = ({
  text,
  side = 'top',
  triggerWidth = 120,
  className = '',
  url,
  tooltipClassName = '',
  contentWidth = 'w-40',
  isRedirectContent = false
}) => {
  const triggerContent = isRedirectContent ? (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
    >
      <div
        className={`flex items-start ${className}`}
        style={{ width: `${triggerWidth}px` }}
      >
        <Text
          size='13'
          className='text-primary-11 inline-block max-w-full cursor-pointer truncate border-b border-dotted border-gray-500 leading-none'
        >
          {text}
        </Text>
      </div>
    </a>
  ) : (
    <div
      className={`flex items-start ${className}`}
      style={{ width: `${triggerWidth}px` }}
    >
      <Text
        size='13'
        className='text-primary-11 inline-block max-w-full cursor-pointer truncate border-b border-dotted border-gray-500 leading-none'
      >
        {text}
      </Text>
    </div>
  );

  const tooltipContent = (
    <div className={`flex ${contentWidth} flex-col items-start gap-2`}>
      <Text
        size='12'
        className='text-primary-11'
      >
        {text}
      </Text>
      {url && (
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
      )}
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
