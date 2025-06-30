import { useState } from 'react';

import { blockchains, stackedChartData } from '@/components/Charts/chartData';
import CompoundFeeRecieved from '@/components/Charts/CompoundFeeRecieved/CompoundFeeRecieved';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import { useChartControls } from '@/shared/hooks/useChartControls';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

type OptionType = { id: string; label: string };

const CompoundFeeRevenueRecieved = () => {
  const {
    activeTab,
    barSize,
    barCount,
    handleTabChange,
    handleBarSizeChange,
    handleVisibleBarsChange
  } = useChartControls({ initialTimeRange: '7B', initialBarSize: 'D' });

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
          value={barSize}
          onTabChange={handleBarSizeChange}
        />

        <TabsGroup
          tabs={['7B', '30B', '90B', '180B']}
          value={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      <CompoundFeeRecieved
        data={stackedChartData}
        barCount={barCount}
        barSize={barSize}
        visibleSeriesKeys={selectedChains.map((chain) => chain.id)}
        onVisibleBarsChange={handleVisibleBarsChange}
      />
    </Card>
  );
};

export default CompoundFeeRevenueRecieved;
