import { FC, ReactNode } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';

import Text from '../Text/Text';

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
        'bg-primary-15 w-full overflow-hidden rounded-lg shadow-md',
        className
      )}
    >
      {title && (
        <div className={cn('bg-primary-10 px-10 py-4', headerClassName)}>
          <Text
            tag='h3'
            size='13'
            className={cn(titleClassName)}
          >
            {title}
          </Text>
        </div>
      )}
      <div className={cn('p-10', contentClassName)}>{children}</div>
    </div>
  );
};

export default Card;
