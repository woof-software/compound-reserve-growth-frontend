import React from 'react';

import {
  defaultExplorer,
  explorers,
  sliceAddress
} from '@/shared/lib/utils/utils';
import Text from '@/shared/ui/Text/Text';

import { ClipboardButton } from '../CopyButton/CopyButton';
import HoverCard from '../HoverCard/HoverCard';

interface AddressTooltipProps {
  text: string;
  address: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  triggerWidth?: number;
  className?: string;
  chain: string;
}

export const AddressTooltip: React.FC<AddressTooltipProps> = ({
  text,
  address,
  chain,
  side = 'top',
  triggerWidth = 120,
  className = ''
}) => {
  const explorerUrl =
    (chain && explorers[chain.toLowerCase()]) || defaultExplorer;
  const fullExplorerLink = `${explorerUrl}${address}`;

  const triggerContent = (
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
    <div className='flex w-48 flex-col items-start gap-2 p-1'>
      <Text
        size='13'
        className='text-primary-11'
      >
        {text}
      </Text>
      <div className='flex w-full items-center justify-between'>
        <Text
          size='13'
          className='text-primary-11'
        >
          {sliceAddress(address, 7)}
        </Text>
        <ClipboardButton textToCopy={address} />
      </div>
      <div className='flex w-full items-center justify-between'>
        <a
          href={fullExplorerLink}
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary-11 flex w-full items-center justify-between text-sm transition-colors hover:text-white'
        >
          <Text
            size='13'
            className='inline-block max-w-full truncate border-b border-dotted border-gray-500 leading-none'
          >
            View on Explorer
          </Text>
        </a>
        <ClipboardButton textToCopy={fullExplorerLink} />
      </div>
    </div>
  );

  return (
    <HoverCard
      content={tooltipContent}
      side={side}
    >
      {triggerContent}
    </HoverCard>
  );
};
