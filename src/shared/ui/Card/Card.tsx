import { FC, ReactNode } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';

import Text from '../Text/Text';
import View from '../View/View';

interface CardProps {
  title?: string;

  children: ReactNode;

  className?: {
    container?: string;

    header?: string;

    content?: string;

    title?: string;
  };
}

const Card: FC<CardProps> = ({
  title,

  children,

  className
}) => {
  return (
    <div
      className={cn(
        'bg-card-content w-full overflow-hidden rounded-lg shadow-md',
        className?.container
      )}
    >
      <View.Condition if={Boolean(title)}>
        <div className={cn('bg-card-header px-10 py-4', className?.header)}>
          <Text
            tag='h3'
            size='13'
            weight='500'
            lineHeight='27'
            className={cn(className?.title)}
          >
            {title}
          </Text>
        </div>
      </View.Condition>

      <div className={cn('bg-card-content p-10', className?.content)}>
        {children}
      </div>
    </div>
  );
};

export default Card;
