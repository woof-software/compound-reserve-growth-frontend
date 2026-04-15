import React, { ReactNode, useState } from 'react';

import { useMediaQuery } from '@/refactor/hooks/useMediaQuery';
import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import { Radio } from '@/shared/ui/RadioButton/RadioButton';
import Text from '@/shared/ui/Text/Text';

export type Option = { label: string; value: string };

interface GroupFiltersProps {
  children: ReactNode;
  options: Option[];
  selectedOptions: Option[];
  setSelectedOptions: (option: Option) => void;
}

export const GroupFilters = (props: GroupFiltersProps) => {
  const { children, options, selectedOptions, setSelectedOptions } = props;

  const [isDrawer, setIsDrawer] = useState(false);

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  const radioValue = selectedOptions[0]?.value ?? null;

  const handleChange = (val: string | number) => {
    const option = options.find((o) => o.value === String(val));
    if (option) setSelectedOptions(option);
  };

  if (isMobile) {
    return (
      <>
        <Button
          className='bg-secondary-27 text-gray-11 flex w-full min-w-[130px] max-w-[130px] gap-1.5 rounded-lg p-2.5 text-[14px] leading-4 font-semibold sm:w-auto h-[44px]'
          onClick={() => setIsDrawer(true)}
        >
          <Icon name='group-grid' className='h-[18px] w-[18px] fill-none' />
          Group
        </Button>
        <Drawer onClose={() => setIsDrawer(false)} isOpen={isDrawer}>
          <Text
            size='17'
            weight='700'
            lineHeight='140'
            align='center'
            className='mb-5 w-full'
          >
            Group
          </Text>
          <Radio.Group
            direction='vertical'
            className='gap-1.5'
            value={radioValue}
            onChange={handleChange}
          >
            {options.map((option) => (
              <Radio.Item
                key={option.value}
                value={option.value}
                className={cn('p-3', {
                  'bg-secondary-38 rounded-lg': radioValue === option.value
                })}
                label={
                  <Radio.Label
                    className={cn({ 'text-secondary-28': radioValue === option.value })}
                    label={option.label}
                  />
                }
              />
            ))}
          </Radio.Group>
        </Drawer>
      </>
    );
  }

  return children;
};