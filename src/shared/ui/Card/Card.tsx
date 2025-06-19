import { FC, ReactNode } from 'react';

import { cn } from '@/shared/lib/ClassNames/ClassNames';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
}

const Card: FC<CardProps> = ({
  title,
  children,
  className,
  titleClassName,
  headerClassName,
  contentClassName
}) => {
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-lg bg-white shadow-md',
        className
      )}
    >
      {title && (
        <div className={cn('bg-gray-50 px-10 py-4', headerClassName)}>
          <h3 className={cn('text-gray-900', titleClassName)}>{title}</h3>
        </div>
      )}
      <div className={cn('p-10', contentClassName)}>{children}</div>
    </div>
  );
};

export default Card;
