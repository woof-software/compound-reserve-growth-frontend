import { useState } from 'react';

import { DropdownGroupFilterTrigger } from '@/components/Filter/DropdownFilter/DropdownGroupFilterTrigger';
import { useGroupFilterContext } from '@/components/Filter/GroupFilters';
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
  triggerLabel?: string;
  hideMobileTrigger?: boolean;
}

export function GroupFilter<T>(props: GroupFiltersProps<T>) {
  const {
    options,
    value,
    setValue = noop,
    getLabel,
    getKey,
    triggerLabel = 'Group by',
  } = props;

  const groupContext = useGroupFilterContext();
  const isGrouped = groupContext !== null;

  const [radioValue, setRadioValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [standaloneDrawerOpen, setStandaloneDrawerOpen] = useState(false);

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  const isExpanded = isGrouped
    ? groupContext.expandedFilter === triggerLabel
    : standaloneDrawerOpen;

  const isOtherExpanded = isGrouped
    ? groupContext.expandedFilter !== null && groupContext.expandedFilter !== triggerLabel
    : false;

  const isApplyButtonChanged = radioValue !== value;
  const isApplyButtonDisabled = !!radioValue;

  const openMobile = () => {
    setRadioValue(value);
    if (isGrouped) {
      groupContext.setExpandedFilter(triggerLabel);
    } else {
      setStandaloneDrawerOpen(true);
    }
  };

  const closeMobile = () => {
    setRadioValue(value);
    if (isGrouped) {
      groupContext.setExpandedFilter(null);
    } else {
      setStandaloneDrawerOpen(false);
    }
  };

  const toggle = () => setIsOpen((prev) => !prev);

  const onApply = () => {
    setValue(radioValue);
    closeMobile();
  };

  const onClearAll = () => {
    const [firstOption] = options;

    if (firstOption) {
      setRadioValue(firstOption);
      setValue(firstOption);
    }

    closeMobile();
  };

  if (isMobile) {
    if (isGrouped) {
      if (isOtherExpanded) return null;

      if (!isExpanded) {
        return (
          <DropdownGroupFilterTrigger
            label={getLabel(value)}
            triggerLabel={triggerLabel}
            onClick={openMobile}
            isOpen={false}
          />
        );
      }

      return (
        <>
          <div className='flex items-center justify-between'>
            <Button onClick={closeMobile} className='absolute top-10 h-6 w-6'>
              <Icon name='arrow-line' className='h-6 w-6' />
            </Button>
            <Text size='17' weight='700' lineHeight='140' align='center' className='mb-8 w-full'>
              {triggerLabel}
            </Text>
          </div>
          <>
            <div className='mt-8 max-h-80 overflow-y-auto'>
              <Radio.Group direction='vertical' className='gap-1.5' value={getKey(radioValue)}>
                {options.map((option) => (
                  <Radio.Item
                    key={getKey(option)}
                    value={getKey(option)}
                    className={cn('p-3', {
                      'bg-secondary-38 rounded-lg': radioValue === getKey(option),
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
            </div>
            <div className='mt-5 grid w-full gap-3'>
              <Button
                disabled={!(isApplyButtonDisabled && isApplyButtonChanged)}
                onClick={onApply}
                className={cn(
                  'bg-secondary-31 text-secondary-32 h-11.25 w-full rounded-lg text-[11px] leading-4 font-medium',
                  { 'bg-success-13 text-white': isApplyButtonDisabled && isApplyButtonChanged },
                )}
              >
                Apply
              </Button>
              <Button
                onClick={onClearAll}
                className='text-primary-14 h-11.25 w-full rounded-lg text-[11px] leading-4 font-medium'
              >
                Clear All
              </Button>
            </div>
          </>
        </>
      );
    }

    return (
      <>
        <Button
          className='bg-secondary-27 text-gray-11 shadow-13 grow sm:max-w-32.5 flex h-9 min-w-32.5 gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold md:h-8 lg:hidden'
          onClick={openMobile}
        >
          <Icon name='group-grid' className='h-3.5 w-3.5 fill-none' />
          Group
        </Button>
        <Drawer onClose={closeMobile} isOpen={standaloneDrawerOpen}>
          <Text size='17' weight='700' lineHeight='140' align='center' className='mb-5 w-full'>
            Group
          </Text>
          <>
            <div className='mt-8 max-h-80 overflow-y-auto'>
              <Radio.Group direction='vertical' className='gap-1.5' value={getKey(radioValue)}>
                {options.map((option) => (
                  <Radio.Item
                    key={getKey(option)}
                    value={getKey(option)}
                    className={cn('p-3', {
                      'bg-secondary-38 rounded-lg': radioValue === getKey(option),
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
            </div>
            <div className='mt-5 grid w-full gap-3'>
              <Button
                disabled={!(isApplyButtonDisabled && isApplyButtonChanged)}
                onClick={onApply}
                className={cn(
                  'bg-secondary-31 text-secondary-32 h-11.25 w-full rounded-lg text-[11px] leading-4 font-medium',
                  { 'bg-success-13 text-white': isApplyButtonDisabled && isApplyButtonChanged },
                )}
              >
                Apply
              </Button>
              <Button
                onClick={onClearAll}
                className='text-primary-14 h-11.25 w-full rounded-lg text-[11px] leading-4 font-medium'
              >
                Clear All
              </Button>
            </div>
          </>
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
          triggerLabel={triggerLabel}
          onClick={toggle}
          isOpen={isOpen}
        />
      }
    >
      <div className='my-2 mr-0.75 ml-2 max-h-45 overflow-auto'>
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