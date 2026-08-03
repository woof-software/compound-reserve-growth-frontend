import React, { useState } from 'react';

import { DropdownFilterTriggerSingle } from '@/components/Filter/DropdownFilter/DropdownFilterTriggerSingle';
import { useFilterContext } from '@/components/Filter/Filters';
import { OptionsList } from '@/components/Filter/OptionsList';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { noop } from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import { Dropdown } from '@/shared/ui/DropdownRef/Dropdown';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

export interface DropdownFilterSingleProps<T> {
  triggerLabel: string;
  options: T[];
  value: T;
  getLabel: (o: T) => string;
  getKey: (o: T) => string;
  setValue?: (v: T) => void;
  prefix?: string;
}

export const DropdownFilterSingle = <T, >(props: DropdownFilterSingleProps<T>) => {
  const {
    options,
    value,
    setValue = noop,
    getLabel,
    getKey,
    prefix = '',
    triggerLabel
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(prev => !prev);

  const { expandedFilter, setExpandedFilter } = useFilterContext();

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  if (isMobile) {
    const isExpanded = expandedFilter === triggerLabel;
    const isOtherExpanded = expandedFilter !== null && !isExpanded;

    if (isOtherExpanded) return null;

    if (!isExpanded) {
      return (
        <DropdownFilterTriggerSingle
          prefix={prefix}
          label={getLabel(value)}
          onClick={() => setExpandedFilter(triggerLabel)}
        />
      );
    }

    return (
      <>
        <div className={'flex items-center justify-between'}>
          <Button
            onClick={() => setExpandedFilter(null)}
            className='absolute top-[40px] h-[24px] w-[24px]'
          >
            <Icon name='arrow-line' className='h-6 w-6' />
          </Button>
          <Text
            size='17'
            weight='700'
            lineHeight='140'
            align='center'
            className='mb-8 w-full'
          >
            {triggerLabel}
          </Text>
        </div>
        <div className='hide-scrollbar mt-8 max-h-80 overflow-y-auto'>
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
      </>
    );
  }

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={
        <DropdownFilterTriggerSingle
          prefix={prefix}
          label={getLabel(value)}
          onClick={toggle}
        />
      }
    >
      <div className='my-2 mr-[3px] ml-2 max-h-[131px] overflow-auto'>
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
};