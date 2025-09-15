import React, { FC, useMemo } from 'react';

import { defaultExplorer, explorers } from '@/shared/consts';
import { cn } from '@/shared/lib/classNames';
import { sliceAddress } from '@/shared/lib/utils';
import { HoverCard, Icon, Text } from '@/shared/ui/atoms';
import { ClipboardButton } from '@/shared/ui/molecules/CopyButton';

type SideType = 'top' | 'bottom' | 'left' | 'right';

interface AddressTooltipProps {
  text: string;
  address: string;
  chain: string;
  side?: SideType;
  triggerWidth?: number;
  className?: string;
}

const AddressTooltip: FC<AddressTooltipProps> = ({
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
    [triggerWidth, text, className]
  );

  const tooltipContent = useMemo(
    () => (
      <div className='flex w-50 flex-col items-start gap-2'>
        <Text
          size='12'
          className='text-primary-11 break-all'
        >
          {text}
        </Text>
        <div className='flex w-full items-center justify-between'>
          <Text
            size='12'
            className='text-primary-11'
          >
            {sliceAddress(address, 7)}
          </Text>
          <ClipboardButton textToCopy={address} />
        </div>
        <div className='flex w-full items-center justify-between'>
          <Text
            size='12'
            className='text-primary-11'
          >
            View on Explorer
          </Text>
          <a
            href={fullExplorerLink}
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
      </div>
    ),
    [address, fullExplorerLink, text]
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

export { AddressTooltip };
