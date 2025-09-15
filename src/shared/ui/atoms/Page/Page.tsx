import { ComponentPropsWithoutRef, FC, memo } from 'react';

import { useScrollToHash } from '@/shared/hooks';
import { cn } from '@/shared/lib/classNames';

type PageProps = ComponentPropsWithoutRef<'main'> & {
  isLoading?: boolean;
};

export const PAGE_ID = 'PAGE_ID';

const PageComponent: FC<PageProps> = ({
  children,
  id,
  isLoading,
  className,
  ...props
}) => {
  useScrollToHash(!isLoading);

  return (
    <main
      id={id || PAGE_ID}
      className={cn(
        'mx-auto flex w-full max-w-[1084px] flex-grow flex-col',
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
};

const Page = memo(PageComponent);

export { Page };
