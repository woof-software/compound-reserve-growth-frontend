import { FC, HTMLAttributes, ReactNode } from 'react';

import BreakPointBlock from '@/components/BreakPointBlock';
import { useMediaWidth } from '@/shared/hooks/useMediaWidth';
import { cn } from '@/shared/lib/classNames/classNames';

import View from '../View/View';

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
  const { width } = useMediaWidth();

  return (
    <>
      <View.Condition if={width < 768}>
        <BreakPointBlock />
      </View.Condition>
      <View.Condition if={width >= 768}>
        <div
          className={cn(
            `tablet:mx-auto tablet:px-0 tablet:max-w-[${maxWidth}px] flex min-h-screen max-w-full flex-col px-4`,
            className
          )}
          {...props}
        >
          {children}
        </div>
      </View.Condition>
    </>
  );
};

export default PageWrapper;
