import { Dispatch, ReactNode, SetStateAction, useEffect, useRef } from 'react';

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
  const { children, trigger, isOpen, setIsOpen, onClose = noop } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target instanceof Node)) return;

      if (wrapperRef.current && !wrapperRef.current.contains(e.target) ) {
        setIsOpen(false);
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={'relative'}>
      {trigger}
      <div className={cn(
        'absolute z-10 mt-2 w-48 rounded-lg shadow-lg dark:bg-primary-15 border-[0.25px] border-border max-w-[168px]',
        isOpen
          ? 'animate-dropdown-bounce pointer-events-auto'
          : 'hidden'
      )}>
        {children}
      </div>
    </div>
  );
};