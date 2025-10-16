import React, { useCallback, useMemo, useState } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Each from '@/shared/ui/Each/Each';
import { Radio } from '@/shared/ui/RadioButton/RadioButton';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

type SortDirection = 'asc' | 'desc';

type SortAdapter<T extends string> = {
  key: T | null;
  type: SortDirection;
};

type SortAccessor<T extends string> = {
  header: string;
  accessorKey: T;
};

interface SortDrawerProps<T extends string> {
  isOpen: boolean;
  sortType: SortAdapter<T>;
  columns: SortAccessor<T>[];
  onClose: () => void;
  onKeySelect: (value: T | null) => void;
  onTypeSelect: (value: SortDirection) => void;
}

const SortDrawer = <T extends string>({
  isOpen,
  sortType,
  columns,
  onClose,
  onKeySelect,
  onTypeSelect
}: SortDrawerProps<T>) => {
  const [tabValue, setTabValue] = useState<string>(
    sortType?.type === 'asc' ? 'Ascending' : 'Descending'
  );

  const [radioValue, setRadioValue] = useState<T | null>(sortType.key ?? null);

  const isApplyButtonDisabled = useMemo(
    () => Boolean(radioValue) && Boolean(tabValue),
    [radioValue, tabValue]
  );

  const initApplyButtonValues = useMemo(() => {
    return {
      tabValue,
      radioValue
    };
  }, [isOpen]);

  const isApplyButtonChanged = useMemo(() => {
    return (
      initApplyButtonValues.tabValue !== tabValue ||
      initApplyButtonValues.radioValue !== radioValue
    );
  }, [initApplyButtonValues, radioValue, tabValue]);

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

    onClose();
  }, [onKeySelect, radioValue, tabValue, onClose, onTypeSelect]);

  const onClearAll = useCallback(() => {
    setRadioValue(null);

    setTabValue('Ascending');

    onKeySelect(null);

    onTypeSelect('asc');

    onClose();
  }, [onClose, onKeySelect, onTypeSelect]);

  const onDrawerClose = useCallback(() => {
    setRadioValue(sortType?.key);

    setTabValue(sortType?.type === 'asc' ? 'Ascending' : 'Descending');

    onKeySelect(sortType?.key);

    onTypeSelect(sortType?.type);

    onClose();
  }, [onClose, onKeySelect, onTypeSelect, sortType]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onDrawerClose}
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
      <Radio.Group
        className='gap-1.5'
        direction='vertical'
        value={radioValue}
        onChange={(v) => setRadioValue(v as any)}
      >
        <Each
          data={columns}
          render={(column, index) => (
            <Radio.Item
              key={index}
              className={cn('p-3', {
                'bg-secondary-38 rounded-lg': radioValue === column.accessorKey
              })}
              value={column.accessorKey}
              label={
                <Radio.Label
                  className={cn({
                    'text-secondary-28': radioValue === column.accessorKey
                  })}
                  label={column.header}
                />
              }
            />
          )}
        />
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
  );
};

export default SortDrawer;
