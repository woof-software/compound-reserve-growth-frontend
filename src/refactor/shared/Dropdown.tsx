import { Dispatch, ReactNode, SetStateAction, useEffect, useRef } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';

interface DropdownProps {
  children: ReactNode;
  trigger: ReactNode;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const Dropdown = (props: DropdownProps) => {
  const { children, trigger, isOpen, setIsOpen } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={'relative'}>
      {trigger}
      <div className={cn(
        'absolute z-10 mt-2 w-48 rounded-lg shadow-lg dark:bg-primary-15 border-[0.25px] border-border',
        'transition-all origin-top',
        isOpen
          ? 'opacity-100 animate-dropdown-bounce pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      )}>
        {children}
      </div>
    </div>
  );
};