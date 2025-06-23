import { ReactNode } from 'react';

import { Tooltip } from '@/components/Tooltip/Tooltip';
import { cn } from '@/shared/lib/classNames/classNames';

import Text from '../Text/Text';

interface ValueMetricFieldProps {
  value: string;
  label: string;
  badge?: string;
  badgeType?: 'positive' | 'negative';
  icon?: ReactNode;
  iconText?: string;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
  badgeClassName?: string;
  iconClassName?: string;
  iconTextClassName?: string;
  containerClassName?: string;
}

const ValueMetricField = ({
  value,
  label,
  badge,
  badgeType = 'positive',
  icon,
  iconText,
  className,
  valueClassName,
  labelClassName,
  badgeClassName,
  iconClassName,
  iconTextClassName,
  containerClassName
}: ValueMetricFieldProps) => {
  const badgeStyles = {
    positive: 'text-success-11 bg-success-12 px-1.5 py-1 rounded-full',
    negative: 'text-red-11 bg-red-10 px-1.5 py-1 rounded-full'
  };

  return (
    <div className={cn('flex flex-col gap-3.5', className)}>
      {(icon || iconText) && (
        <div className='flex items-center gap-2'>
          {icon && <div className={cn(iconClassName)}>{icon}</div>}
          {iconText && (
            <Text
              size='16'
              className={cn(iconTextClassName)}
            >
              {iconText}
            </Text>
          )}
        </div>
      )}

      <div className={cn('flex flex-col gap-2', containerClassName)}>
        <div className='flex items-center gap-3.5'>
          <Text
            size='32'
            weight='700'
            className={cn(valueClassName)}
          >
            {value}
          </Text>
          {badge && (
            <Tooltip content='Change over last 30 days'>
              <div
                className={cn(
                  badgeStyles[badgeType],
                  'cursor-pointer',
                  badgeClassName
                )}
              >
                {badge}
              </div>
            </Tooltip>
          )}
        </div>
        <Text
          size='11'
          weight='500'
          className={cn('text-primary-13', labelClassName)}
        >
          {label}
        </Text>
      </div>
    </div>
  );
};

export default ValueMetricField;
