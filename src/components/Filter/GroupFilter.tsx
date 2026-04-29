import { noop } from '@/shared/lib/utils/utils'
import React, { useEffect, useState } from 'react';

import { DropdownGroupFilterTrigger } from '@/components/Filter/DropdownFilter/DropdownGroupFilterTrigger';
import { OptionsList } from '@/components/Filter/OptionsList';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { Dropdown } from '@/shared/ui/DropdownRef/Dropdown';
import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import { Radio } from '@/shared/ui/RadioButton/RadioButton';
import Text from '@/shared/ui/Text/Text';

export interface GroupFiltersProps<T> {
  options: T[];
  value: T;
  getLabel: (o: T) => string;
  getKey: (o: T) => string;
  setValue?: (v: T) => void;
}

export function GroupFilter<T>(props: GroupFiltersProps<T>) {
  const {
    options,
    value,
    setValue = noop,
    getLabel,
    getKey,
  } = props;

  const [isDrawer, setIsDrawer] = useState(false);
  const [isDropdown, setIsDropdown] = useState(false);
  const [radioValue, setRadioValue] = useState(() => getKey(value));

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  useEffect(() => {
    if (isDrawer) setRadioValue(getKey(value));
  }, [isDrawer]);

  const isApplyButtonChanged = radioValue !== getKey(value);
  const isApplyButtonDisabled = Boolean(radioValue);

  const toggle = () => setIsDropdown(prev => !prev);

  const handleChange = (val: string) => {
    const option = options.find((o) => getKey(o) === val);
    if (option) setValue(option);
  };

  const onApply = () => {
    handleChange(radioValue);
    setIsDrawer(false);
  };

  const onClearAll = () => {
    const [firstOption] = options;

    if (firstOption) {
      setRadioValue(getKey(firstOption));
      setValue(firstOption);
    }

    setIsDrawer(false);
  };

  const onDrawerClose = () => {
    setRadioValue(getKey(value));
    setIsDrawer(false);
  };

  if (isMobile) {
    return (
      <>
        <Button
          className='bg-secondary-27 text-gray-11 shadow-13 grow md:max-w-[130px] flex h-9 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold md:h-8 lg:hidden'
          onClick={() => setIsDrawer(true)}
        >
          <Icon name='group-grid' className='h-[14px] w-[14px] fill-none' />
          Group
        </Button>
        <Drawer onClose={onDrawerClose} isOpen={isDrawer}>
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
            onChange={setRadioValue}
          >
            {options.map((option) => (
              <Radio.Item
                key={getKey(option)}
                value={getKey(option)}
                className={cn('p-3', {
                  'bg-secondary-38 rounded-lg': radioValue === getKey(option)
                })}
                label={
                  <Radio.Label
                    className={cn({ 'text-secondary-28': radioValue === getKey(option) })}
                    label={getLabel(option)}
                  />
                }
              />
            ))}
          </Radio.Group>
          <div className='mt-5 grid w-full gap-3'>
            <Button
              disabled={!Boolean(isApplyButtonDisabled && isApplyButtonChanged)}
              onClick={onApply}
              className={cn(
                'bg-secondary-31 text-secondary-32 h-[45px] w-full rounded-lg text-[11px] leading-4 font-medium',
                {
                  'bg-success-13 text-white':
                    isApplyButtonDisabled && isApplyButtonChanged
                }
              )}
            >
              Apply
            </Button>
            <Button
              onClick={onClearAll}
              className='text-primary-14 h-[45px] w-full rounded-lg text-[11px] leading-4 font-medium'
            >
              Clear All
            </Button>
          </div>
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
          onClick={toggle}
          isOpen={isDropdown}
        />
      }
    >
      <div className='my-2 mr-[3px] ml-2 max-h-[180px] overflow-auto'>
        <OptionsList
          options={options}
          getLabel={getLabel}
          getKey={getKey}
          onSelect={(v) => {
            setValue(v)
            setIsDropdown(false)
          }}
          selectedOptions={[value]}
        />
      </div>
    </Dropdown>
  );
}