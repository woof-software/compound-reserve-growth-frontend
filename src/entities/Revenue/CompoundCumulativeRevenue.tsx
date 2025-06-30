import { useState } from 'react';
import * as React from 'react';

import { blockchains } from '@/components/Charts/chartData';
import LineChart from '@/components/Charts/Line/Line';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import { BarSize, OptionType, TimeRange } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

const SERIES_DATA = [
  ...Array.from({ length: 100 }, (_, i) => ({
    x: Date.UTC(2000 + i, 0, 1),
    y: Math.round(Math.random() * 100)
  }))
];

const CompoundCumulativeRevenue = () => {
  const [feeRecievedTab, setFeeRecievedTab] = useState<TimeRange>('7B');
  const [feeRecievedBarSize, setFeeRecievedBarSize] = useState<BarSize>('D');

  const [selectedChains, setSelectedChains] = useState<OptionType[]>([]);

  const onChainChange = (selectedOptions: OptionType[]) => {
    setSelectedChains(selectedOptions);
  };

  const onFeeRecievedTabChange = (tab: TimeRange) => {
    setFeeRecievedTab(tab);
  };

  const onFeeRecievedBarSizeChange = (barSize: BarSize) => {
    setFeeRecievedBarSize(barSize);
  };

  return (
    <Card
      title='Compound Cumulative Revenue'
      className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
        <div className='flex gap-2'>
          <MultiSelect
            options={blockchains}
            value={selectedChains}
            onChange={onChainChange}
            placeholder='Chain'
          />

          <MultiSelect
            options={blockchains}
            onChange={() => {}}
            placeholder='Market'
          />
        </div>

        <TabsGroup
          tabs={['D', 'W', 'M']}
          value={feeRecievedBarSize}
          onTabChange={(value) => {
            if (value === 'D' || value === 'W' || value === 'M') {
              onFeeRecievedBarSizeChange(value);
            }
          }}
        />

        <TabsGroup
          tabs={['7B', '30B', '90B', '180B']}
          value={feeRecievedTab}
          onTabChange={(value) => {
            if (
              value === '7B' ||
              value === '30B' ||
              value === '90B' ||
              value === '180B'
            ) {
              onFeeRecievedTabChange(value);
            }
          }}
        />
      </div>

      <LineChart
        data={SERIES_DATA}
        className='max-h-[400px]'
      />
    </Card>
  );
};

export default CompoundCumulativeRevenue;
