import { FC, ReactNode } from 'react';

import { cn } from '@/shared/lib/ClassNames/ClassNames';

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
}

const ValueMetricField: FC<ValueMetricFieldProps> = ({
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
  iconTextClassName
}) => {
  const badgeStyles = {
    positive: 'text-green-600 bg-green-100 px-1.5 py-1 rounded-full',
    negative: 'text-red-600 bg-red-100 px-1.5 py-1 rounded-full',
    neutral: 'text-gray-600 bg-gray-100 px-1.5 py-1 rounded-full'
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(icon || iconText) && (
        <div className='flex items-center gap-2'>
          {icon && <div className={cn(iconClassName)}>{icon}</div>}
          {iconText && (
            <span className={cn(iconTextClassName)}>{iconText}</span>
          )}
        </div>
      )}

      <div className='flex items-baseline gap-2'>
        <span className={cn(valueClassName)}>{value}</span>
        {badge && (
          <span className={cn(badgeStyles[badgeType], badgeClassName)}>
            {badge}
          </span>
        )}
      </div>

      <p className={cn(labelClassName)}>{label}</p>
    </div>
  );
};

export default ValueMetricField;
