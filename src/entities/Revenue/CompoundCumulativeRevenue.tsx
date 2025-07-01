import { useMemo, useState } from 'react';

import { blockchains } from '@/components/Charts/chartData';
import LineChart from '@/components/Charts/Line/Line';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { OptionType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

const CompoundCumulativeRevenue = () => {
  const [selectedChains, setSelectedChains] = useState<OptionType[]>([]);

  const onChainChange = (selectedOptions: OptionType[]) => {
    setSelectedChains(selectedOptions);
  };

  const {
    activeTab,
    barSize,
    barCount,
    handleTabChange,
    handleBarSizeChange,
    handleVisibleBarsChange
  } = useChartControls({
    initialTimeRange: '7B',
    initialBarSize: 'D'
  });

  const fullFiveYearData = useMemo(() => {
    const data: { x: number; y: number }[] = [];
    const startDate = new Date('2020-01-01');
    const endDate = new Date('2025-01-01');
    let baseValue = 1000000;

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      baseValue *= 1 + (Math.random() - 0.45) * 0.01;
      data.push({
        x: d.getTime(),
        y: Math.round(baseValue)
      });
    }
    return data;
  }, []);

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
          value={barSize}
          onTabChange={handleBarSizeChange}
        />

        <TabsGroup
          tabs={['7B', '30B', '90B', '180B']}
          value={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      <LineChart
        className='max-h-[400px]'
        barSize={barSize}
        barCountToSet={barCount}
        onVisibleBarsChange={handleVisibleBarsChange}
        data={fullFiveYearData as []}
        groupBy={''}
      />
    </Card>
  );
};

export default CompoundCumulativeRevenue;
