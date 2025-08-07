import { ReactNode } from 'react';

import { Tooltip } from '@/components/Tooltip/Tooltip';
import { cn } from '@/shared/lib/classNames/classNames';

import Text from '../Text/Text';
import View from '../View/View';

interface ValueMetricFieldProps {
  value: string;
  label: string;
  badge?: string;
  badgeType?: 'positive' | 'negative';
  icon?: ReactNode;
  iconText?: string;
  className?: {
    container?: string;
    value?: string;
    label?: string;
    badge?: string;
    icon?: string;
    iconText?: string;
    content?: string;
  };
}

const ValueMetricField = ({
  value,
  label,
  badge,
  badgeType = 'positive',
  icon,
  iconText,
  className
}: ValueMetricFieldProps) => {
  const badgeStyles = {
    positive: 'text-success-11 bg-success-12',
    negative: 'text-red-11 bg-red-10'
  };

  const formattedBadge =
    badge && badge.startsWith('$-') ? `-${badge.replace('-', '')}` : badge;

  return (
    <div className={cn('flex flex-col gap-3.5', className?.container)}>
      <View.Condition if={Boolean(icon || iconText)}>
        <div className='flex items-center gap-2.5'>
          <View.Condition if={Boolean(icon)}>
            <div className={cn(className?.icon)}>{icon}</div>
          </View.Condition>
          <View.Condition if={Boolean(iconText)}>
            <Text
              size='16'
              weight='500'
              lineHeight='32'
              className={cn(className?.iconText)}
            >
              {iconText}
            </Text>
          </View.Condition>
        </div>
      </View.Condition>
      <div className={cn('flex flex-col gap-5 lg:gap-2', className?.content)}>
        <div className='flex flex-wrap items-center gap-3.5'>
          <Text
            size='32'
            weight='700'
            lineHeight='38'
            className={cn(className?.value)}
          >
            {value}
          </Text>
          <View.Condition if={Boolean(badge)}>
            <Tooltip content='Change over last 30 days'>
              <div
                className={cn(
                  'cursor-pointer rounded-full px-1.5 py-0.5 text-sm leading-6 font-medium',
                  badgeStyles[badgeType],
                  className?.badge
                )}
              >
                {formattedBadge}
              </div>
            </Tooltip>
          </View.Condition>
        </div>
        <Text
          size='11'
          weight='500'
          className={cn(
            'text-primary-13 leading-[19px] lg:leading-[27px]',
            className?.label
          )}
        >
          {label}
        </Text>
      </div>
    </div>
  );
};

export default ValueMetricField;
