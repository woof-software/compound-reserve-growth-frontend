import { FC, ReactNode } from 'react';

import { cn } from '@/shared/lib/classNames';

import { Icon } from '../../atoms';

const ChartIconToggle: FC<{
  active: boolean;
  onClick: () => void;
  onIcon: string;
  offIcon: string;
  ariaLabel: string;
  className?: {
    container?: string;
    iconContainer?: string;
    icon?: string;
  };
  children?: ReactNode;
}> = ({ active, onClick, onIcon, offIcon, ariaLabel, children, className }) => (
  <button
    type='button'
    aria-pressed={active}
    aria-label={ariaLabel}
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    className={cn(
      'shadow-16 dark:shadow-13 bg-primary-20 grid cursor-pointer place-items-center rounded-lg p-1 outline-none select-none',
      className?.container
    )}
  >
    <span className={cn('relative h-6 w-6', className?.iconContainer)}>
      <Icon
        name={onIcon}
        className={cn(
          'absolute inset-0 h-6 w-6 transition-opacity duration-150 ease-out',
          active ? 'opacity-0' : 'opacity-100',
          className?.icon
        )}
      />
      <Icon
        name={offIcon}
        className={cn(
          'absolute inset-0 h-6 w-6 transition-opacity duration-150 ease-out',
          active ? 'opacity-100' : 'opacity-0',
          className?.icon
        )}
      />
    </span>
    {children}
  </button>
);

export { ChartIconToggle };
