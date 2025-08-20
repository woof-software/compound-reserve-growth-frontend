import React, { FC, useCallback, useState } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Each from '@/shared/ui/Each/Each';
import { Radio, RadioGroup } from '@/shared/ui/RadioButton/RadioButton';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

interface SortDrawerProps {
  isOpen: boolean;

  sortType: {
    key: string;

    type: string;
  };

  columns: { header: string; accessorKey: string }[];

  onClose: () => void;

  onKeySelect: (value: string) => void;

  onTypeSelect: (value: string) => void;
}

const SortDrawer: FC<SortDrawerProps> = ({
  isOpen,
  sortType,
  columns,
  onClose,
  onKeySelect,
  onTypeSelect
}) => {
  const [tabValue, setTabValue] = useState<string>('Ascending');

  const [radioValue, setRadioValue] = useState<string>(sortType?.key || '');

  const isApplyButtonDisabled = Boolean(radioValue) && Boolean(tabValue);

  const onTabsChange = useCallback((value: string) => {
    setTabValue(value);
  }, []);

  const onApply = useCallback(() => {
    onKeySelect(radioValue);

    if (tabValue === 'Ascending') {
      onTypeSelect('asc');
    } else {
      onTypeSelect('desc');
    }
  }, [radioValue, tabValue, onKeySelect, onTypeSelect]);

  const onClearAll = useCallback(() => {
    setRadioValue('');

    setTabValue('Ascending');

    onKeySelect('');

    onTypeSelect('');
  }, [onKeySelect, onTypeSelect]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
    >
      <Text
        size='17'
        weight='700'
        lineHeight='140'
        align='center'
        className='mb-5 w-full'
      >
        Sort
      </Text>
      <div className='mb-5 flex w-full justify-center'>
        <TabsGroup
          tabs={['Ascending', 'Descending']}
          value={tabValue}
          onTabChange={onTabsChange}
        />
      </div>
      <RadioGroup
        className='gap-1.5'
        direction='vertical'
        value={radioValue}
        onChange={(v) => setRadioValue(v as any)}
      >
        <Each
          data={columns}
          render={(column) => (
            <Radio
              className='p-3'
              value={column.accessorKey}
              label={column.header}
            />
          )}
        />
      </RadioGroup>
      <div className='mt-5 grid w-full gap-3'>
        <Button
          onClick={onApply}
          className={cn(
            'bg-secondary-31 text-secondary-32 h-[45px] w-full rounded-lg text-[11px] leading-4 font-medium',
            {
              'bg-success-13 text-white': isApplyButtonDisabled
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
  );
};

export default SortDrawer;
