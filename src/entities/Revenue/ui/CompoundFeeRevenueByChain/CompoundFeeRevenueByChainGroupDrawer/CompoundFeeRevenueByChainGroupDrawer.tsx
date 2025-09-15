import React, { useCallback, useState } from 'react';

import {
  CompoundFeeRevenueByChainGroupDrawerProps,
  Interval
} from '@/entities/Revenue';
import { cn } from '@/shared/lib/classNames';
import { Button, Each, Icon, Text, View } from '@/shared/ui/atoms';
import { Drawer, Radio } from '@/shared/ui/molecules';

const CompoundFeeRevenueByChainGroupDrawer = ({
  isOpen,
  interval,
  groupDynamic,
  onIntervalSelect,
  onDynamicSelect,
  onClose
}: CompoundFeeRevenueByChainGroupDrawerProps) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const onSelectedFilterClose = useCallback(() => {
    setSelectedKey(null);
  }, []);

  const onSelectFilter = useCallback((selectedFilter: string) => {
    setSelectedKey(selectedFilter);
  }, []);

  const onIntervalSelectClick = useCallback(
    (selectedInterval: Interval) => {
      onIntervalSelect(selectedInterval);

      onClose();

      setSelectedKey(null);
    },
    [onClose, onIntervalSelect]
  );

  const onDynamicSelectClick = useCallback(
    (selectedInterval: string) => {
      onDynamicSelect(selectedInterval);

      onClose();

      setSelectedKey(null);
    },
    [onClose, onDynamicSelect]
  );

  const onDrawerClose = useCallback(() => {
    onClose();

    setSelectedKey(null);
  }, [onClose]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onDrawerClose}
    >
      <View.Condition if={!Boolean(selectedKey)}>
        <Text
          size='17'
          weight='700'
          lineHeight='140'
          align='center'
          className='mb-5 w-full'
        >
          Group
        </Text>
        <div className='grid gap-3'>
          <div
            className='flex h-[42px] cursor-pointer items-center justify-between px-3 py-2.5'
            onClick={() => onSelectFilter(interval.label)}
          >
            <div className='flex items-center gap-1.5'>
              <Icon
                name='plus'
                className='h-2.5 w-2.5'
                color={cn('primary-14', {
                  'secondary-41': Boolean(interval.selectedValue)
                })}
              />
              <Text
                size='14'
                weight='500'
                className={cn('text-primary-14 text-sm font-medium', {
                  'text-secondary-41': Boolean(interval.selectedValue)
                })}
              >
                {interval.label}
              </Text>
            </div>
          </div>
          <div
            className='flex h-[42px] cursor-pointer items-center justify-between px-3 py-2.5'
            onClick={() => onSelectFilter(groupDynamic.label)}
          >
            <div className='flex items-center gap-1.5'>
              <Icon
                name='plus'
                className='h-2.5 w-2.5'
                color={cn('primary-14', {
                  'secondary-41': Boolean(groupDynamic.selectedValue)
                })}
              />
              <Text
                size='14'
                weight='500'
                className={cn('text-primary-14 text-sm font-medium', {
                  'text-secondary-41': Boolean(groupDynamic.selectedValue)
                })}
              >
                {groupDynamic.label}
              </Text>
            </div>
          </div>
        </div>
      </View.Condition>
      <View.Condition if={Boolean(selectedKey)}>
        <View.Condition if={selectedKey === interval.label}>
          <div className='mb-8 flex items-center'>
            <Button onClick={onSelectedFilterClose}>
              <Icon
                name='arrow-line'
                className='h-6 w-6'
              />
            </Button>
            <Text
              size='17'
              weight='700'
              lineHeight='140'
              align='center'
              className='w-[calc(100%-24px)]'
            >
              {interval.label}
            </Text>
          </div>
          <div className='hide-scrollbar mt-8 max-h-[450px] overflow-y-auto'>
            <Radio.Group
              className='gap-1.5'
              direction='vertical'
              value={interval.selectedValue}
              onChange={(v) => onIntervalSelectClick(v as any)}
            >
              <Each
                data={interval.options}
                render={(option, index) => (
                  <Radio.Item
                    key={index}
                    className={cn('p-3', {
                      'bg-secondary-38 rounded-lg':
                        interval.selectedValue === option
                    })}
                    value={option}
                    label={
                      <Radio.Label
                        className={cn({
                          'text-secondary-28': interval.selectedValue === option
                        })}
                        label={option}
                      />
                    }
                  />
                )}
              />
            </Radio.Group>
          </div>
        </View.Condition>
        <View.Condition if={selectedKey === groupDynamic.label}>
          <div className='mb-8 flex items-center'>
            <Button onClick={onSelectedFilterClose}>
              <Icon
                name='arrow-line'
                className='h-6 w-6'
              />
            </Button>
            <Text
              size='17'
              weight='700'
              lineHeight='140'
              align='center'
              className='w-[calc(100%-24px)]'
            >
              {groupDynamic.label}
            </Text>
          </div>
          <div className='hide-scrollbar mt-8 max-h-[450px] overflow-y-auto'>
            <Radio.Group
              className='gap-1.5'
              direction='vertical'
              value={groupDynamic.selectedValue}
              onChange={(v) => onDynamicSelectClick(v as any)}
            >
              <Each
                data={groupDynamic.options}
                render={(option, index) => (
                  <Radio.Item
                    key={index}
                    className={cn('p-3', {
                      'bg-secondary-38 rounded-lg':
                        groupDynamic.selectedValue === option
                    })}
                    value={option}
                    label={
                      <Radio.Label
                        className={cn({
                          'text-secondary-28':
                            groupDynamic.selectedValue === option
                        })}
                        label={option}
                      />
                    }
                  />
                )}
              />
            </Radio.Group>
          </div>
        </View.Condition>
      </View.Condition>
    </Drawer>
  );
};

export { CompoundFeeRevenueByChainGroupDrawer };
