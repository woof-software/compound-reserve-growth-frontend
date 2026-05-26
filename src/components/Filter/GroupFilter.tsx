import { useEffect, useState } from 'react';

import { DropdownGroupFilterTrigger } from '@/components/Filter/DropdownFilter/DropdownGroupFilterTrigger';
import { OptionsList } from '@/components/Filter/OptionsList';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { cn } from '@/shared/lib/classNames/classNames';
import { noop } from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import { Dropdown } from '@/shared/ui/DropdownRef/Dropdown';
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
  
  const [radioValue, setRadioValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  useEffect(() => {
    if (isOpen) setRadioValue(value);
  }, [isOpen]);

  const isApplyButtonChanged = radioValue !== value;
  const isApplyButtonDisabled = Boolean(radioValue);

  const toggle = () => setIsOpen(prev => !prev);

  const onApply = () => {
    setValue(radioValue);
    setIsOpen(false);
  };

  const onClearAll = () => {
    const [firstOption] = options;

    if (firstOption) {
      setRadioValue(firstOption);
      setValue(firstOption);
    }

    setIsOpen(false);
  };

  const onDrawerClose = () => {
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <>
        <Button
          className='bg-secondary-27 text-gray-11 shadow-13 grow md:max-w-[130px] flex h-9 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold md:h-8 lg:hidden'
          onClick={() => setIsOpen(true)}
        >
          <Icon name='group-grid' className='h-[14px] w-[14px] fill-none' />
          Group
        </Button>
        <Drawer onClose={onDrawerClose} isOpen={isOpen}>
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
            value={getKey(radioValue)}
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
                onChange={() => setRadioValue(option)}
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
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={
        <DropdownGroupFilterTrigger
          label={getLabel(value)}
          onClick={toggle}
          isOpen={isOpen}
        />
      }
    >
      <div className='my-2 mr-[3px] ml-2 max-h-[180px] overflow-auto'>
        <OptionsList
          options={options}
          getLabel={getLabel}
          getKey={getKey}
          onSelect={(v) => {
            setValue(v);
            setIsOpen(false);
          }}
          selectedOptions={[value]}
        />
      </div>
    </Dropdown>
  );
}