import { Dispatch, ReactNode, SetStateAction, useEffect, useRef } from 'react';

import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { cn } from '@/shared/lib/classNames/classNames';
import { noop } from '@/shared/lib/utils/utils';

export interface DropdownProps {
  children: ReactNode;
  trigger: ReactNode;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
}

export const Dropdown = (props: DropdownProps) => {
  const {
    children,
    trigger,
    isOpen,
    setIsOpen,
    onClose = noop
  } = props;

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useClickOutside(wrapperRef, () => {
    setIsOpen(false);
    onClose();
  });

  return (
    <div ref={wrapperRef} className={'relative'}>
      {trigger}
      {isOpen && (
        <div
          className={cn(
            'absolute z-10 right-0 mt-2 w-48 rounded-lg shadow-lg dark:bg-primary-15 border-[0.25px] border-border max-w-[168px] animate-dropdown-bounce'
          )}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
};