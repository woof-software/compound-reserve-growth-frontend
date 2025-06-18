import { FC, HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';

export interface PageWrapperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;

  maxWidth?: number;
}

const PageWrapper: FC<PageWrapperProps> = ({
  children,
  className,
  maxWidth = 1084,
  ...props
}) => {
  return (
    <div
      className={cn(
        `max-w-[${maxWidth}px] mx-auto flex min-h-screen flex-col`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default PageWrapper;
