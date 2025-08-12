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
        `mx-auto flex max-w-[${maxWidth}px] min-h-screen w-full flex-col px-4`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default PageWrapper;
