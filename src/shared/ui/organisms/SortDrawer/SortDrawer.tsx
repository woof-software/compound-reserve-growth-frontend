import React, { FC, useCallback, useMemo, useState } from 'react';

import { cn } from '@/shared/lib/classNames';
import { Button, Each, Text } from '@/shared/ui/atoms';
import { Drawer, Radio, TabsGroup } from '@/shared/ui/molecules';

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
  const [tabValue, setTabValue] = useState<string>(
    sortType?.type === 'asc' ? 'Ascending' : 'Descending'
  );

  const [radioValue, setRadioValue] = useState<string>(sortType?.key || '');

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
    setRadioValue('');

    setTabValue('Ascending');

    onKeySelect('');

    onTypeSelect('');

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

export { SortDrawer };
