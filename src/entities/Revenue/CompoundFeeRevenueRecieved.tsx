import { useState } from 'react';

import { blockchains, stackedChartData } from '@/components/Charts/chartData';
import CompoundFeeRecieved from '@/components/Charts/CompoundFeeRecieved/CompoundFeeRecieved';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

type TimeRange = '7B' | '30B' | '90B' | '180B';
type BarSize = 'D' | 'W' | 'M';

type OptionType = { id: string; label: string };

const CompoundFeeRevenueRecieved = () => {
  const [feeRecievedTab, setFeeRecievedTab] = useState<TimeRange>('7B');
  const [feeRecievedBarSize, setFeeRecievedBarSize] = useState<BarSize>('D');

  const [selectedChains, setSelectedChains] = useState<OptionType[]>([]);

  const handleChainChange = (selectedOptions: OptionType[]) => {
    setSelectedChains(selectedOptions);
  };

  return (
    <Card
      title='Compound Fee Revenue Recieved'
      className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
        <div className='flex gap-2'>
          <MultiSelect
            options={blockchains}
            value={selectedChains}
            onChange={handleChainChange}
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
              setFeeRecievedBarSize(value);
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
              setFeeRecievedTab(value);
            }
          }}
        />
      </div>

      <CompoundFeeRecieved
        data={stackedChartData}
        barCount={parseInt(feeRecievedTab.replace('B', ''), 10)}
        barSize={feeRecievedBarSize}
        visibleSeriesKeys={selectedChains.map((chain) => chain.id)}
      />
    </Card>
  );
};

export default CompoundFeeRevenueRecieved;
