import React from 'react';

import { useClipboard } from '@/shared/hooks/useClipboard';
import { cn } from '@/shared/lib/classNames/classNames';
import Icon from '@/shared/ui/Icon/Icon';

interface ClipboardButtonProps {
  textToCopy: string;
  className?: string;
}

export const ClipboardButton = ({
  textToCopy,
  className
}: ClipboardButtonProps) => {
  const [isCopied, copy] = useClipboard();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    copy(textToCopy);
  };

  const handleMouseEvent = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      onMouseDown={handleMouseEvent}
      onMouseUp={handleMouseEvent}
      className={cn(
        'z-10 flex h-4 w-4 cursor-pointer items-center justify-center',
        className
      )}
      aria-label={isCopied ? 'Copied' : 'Copy'}
    >
      {isCopied ? (
        <Icon
          name='сheck-сopy-icon'
          className='h-4 w-4 text-green-500'
        />
      ) : (
        <Icon
          name='copy-icon'
          className='h-4 w-4 text-[#7A8A99]'
        />
      )}
    </button>
  );
};
