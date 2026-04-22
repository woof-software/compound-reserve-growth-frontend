import React, { useState } from 'react';

import { DropdownGroupFilterTrigger } from '@/refactor/DropdownFilter/DropdownGroupFilterTrigger';
import { OptionsList } from '@/refactor/filters/OptionsList';
import { useMediaQuery } from '@/refactor/hooks/useMediaQuery';
import { Dropdown } from '@/refactor/shared/Dropdown';
import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import { Radio } from '@/shared/ui/RadioButton/RadioButton';
import Text from '@/shared/ui/Text/Text';

interface GroupFiltersProps<T> {
  options: T[];
  value: T;
  setValue: (v: T) => void;
  getLabel: (o: T) => string;
  getKey: (o: T) => string;
}

export function GroupFilter<T>(props: GroupFiltersProps<T>) {
  const {
    options,
    value,
    setValue,
    getLabel,
    getKey,
  } = props;

  const [isDrawer, setIsDrawer] = useState(false);
  const [isDropdown, setIsDropdown] = useState(false);

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  const toggle = () => setIsDropdown(prev => !prev);

  const handleChange = (val: string | number) => {
    const option = options.find((o) => getKey(o) === String(val));
    
    if (option) setValue(option);
  };

  const handleReset = () => {
    const [firstElement] = options;
    
    if (firstElement) {
      setValue(firstElement);
    }

    setIsDrawer(false);
  };

  if (isMobile) {
    return (
      <>
        <Button
          className='bg-secondary-27 text-gray-11 flex w-full sm:max-w-[130px] flex-1 gap-1.5 rounded-lg p-2.5 text-[14px] leading-4 font-semibold sm:w-auto h-[44px]'
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
            value={getKey(value)}
            onChange={handleChange}
          >
            {options.map((option) => (
              <Radio.Item
                key={getKey(option)}
                value={getKey(option)}
                className={cn('p-3', {
                  'bg-secondary-38 rounded-lg': getKey(value) === getKey(option)
                })}
                label={
                  <Radio.Label
                    className={cn({ 'text-secondary-28': getKey(value) === getKey(option) })}
                    label={getLabel(option)}
                  />
                }
              />
            ))}
          </Radio.Group>
          <Button
            className={'text-primary-14 w-[100%] hover:bg-secondary-40 h-[44px] lg:h-[30px] rounded-lg text-[11px] font-medium dark:hover:text-white'}
            onClick={handleReset}
          >
            Reset
          </Button>
        </Drawer>
      </>
    );
  }

  return (
    <Dropdown
      isOpen={isDropdown}
      setIsOpen={setIsDropdown}
      trigger={
        <DropdownGroupFilterTrigger
          label={getLabel(value)}
          handler={toggle}
          isOpen={isDropdown}
        />
      }
    >
      <div className='my-2 mr-[3px] ml-2 max-h-[180px] overflow-auto'>
        <OptionsList
          options={options}
          getLabel={getLabel}
          getKey={getKey}
          onSelect={setValue}
          selectedOptions={[value]}
        />
      </div>
    </Dropdown>
  );
};