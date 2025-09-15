import React from 'react';

import { useClipboard } from '@/shared/hooks';
import { cn } from '@/shared/lib/classNames';

import { Icon, View } from '../../atoms';

interface ClipboardButtonProps {
  textToCopy: string;
  className?: string;
}

const ClipboardButton = ({ textToCopy, className }: ClipboardButtonProps) => {
  const [isCopied, onCopy] = useClipboard();

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onCopy(textToCopy);
  };

  const onMouseEvent = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  return (
    <button
      type='button'
      onClick={onClick}
      onMouseDown={onMouseEvent}
      onMouseUp={onMouseEvent}
      className={cn(
        'z-10 flex h-4 w-4 cursor-pointer items-center justify-center',
        className
      )}
      aria-label={isCopied ? 'Copied' : 'Copy'}
    >
      <View.Condition if={isCopied}>
        <Icon
          name='сheck-сopy-icon'
          className='h-4 w-4 text-green-500'
        />
      </View.Condition>
      <View.Condition if={!isCopied}>
        <Icon
          name='copy-icon'
          className='h-4 w-4 text-[#7A8A99]'
        />
      </View.Condition>
    </button>
  );
};

export { ClipboardButton };
