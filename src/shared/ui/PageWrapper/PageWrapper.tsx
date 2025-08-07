import { FC, HTMLAttributes, ReactNode } from 'react';

import BreakPointBlock from '@/components/BreakPointBlock';
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
  const maxWClass = `md:max-w-[${maxWidth}px]`;

  return (
    <>
      <div className='md:hidden'>
        <BreakPointBlock />
      </div>
      <div
        className={cn(
          `hidden md:mx-auto md:flex ${maxWClass} min-h-screen w-full flex-col px-4`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
};

export default PageWrapper;
