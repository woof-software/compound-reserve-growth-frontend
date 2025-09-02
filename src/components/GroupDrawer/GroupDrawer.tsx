import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Each from '@/shared/ui/Each/Each';
import { Radio } from '@/shared/ui/RadioButton/RadioButton';
import Text from '@/shared/ui/Text/Text';

interface GroupDrawerProps {
  isOpen: boolean;

  selectedOption: string;

  options: { header: string; accessorKey: string }[];

  onClose: () => void;

  onSelect: (value: string) => void;
}

const GroupDrawer: FC<GroupDrawerProps> = ({
  isOpen,
  selectedOption,
  options,
  onClose,
  onSelect
}) => {
  const [radioValue, setRadioValue] = useState<string>(selectedOption || '');

  const isApplyButtonDisabled = useMemo(
    () => Boolean(radioValue),
    [radioValue]
  );

  const initApplyButtonValues = useMemo(() => {
    return radioValue;
  }, [isOpen]);

  const isApplyButtonChanged = useMemo(() => {
    return initApplyButtonValues !== radioValue;
  }, [initApplyButtonValues, radioValue]);

  const onApply = useCallback(() => {
    onSelect(radioValue);

    onClose();
  }, [onSelect, radioValue, onClose]);

  const onClearAll = useCallback(() => {
    setRadioValue('');

    onSelect('');

    onClose();
  }, [onClose, onSelect]);

  const onDrawerClose = useCallback(() => {
    setRadioValue(selectedOption);

    onSelect(selectedOption);

    onClose();
  }, [onClose, onSelect, selectedOption]);

  useEffect(() => {
    setRadioValue(selectedOption);
  }, [isOpen]);

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
        Group
      </Text>
      <Radio.Group
        className='gap-1.5'
        direction='vertical'
        value={radioValue}
        onChange={(v) => setRadioValue(v as any)}
      >
        <Each
          data={options}
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

export default GroupDrawer;
