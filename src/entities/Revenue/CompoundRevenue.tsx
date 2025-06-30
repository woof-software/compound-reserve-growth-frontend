import { useMemo, useState } from 'react';

import { blockchains } from '@/components/Charts/chartData';
import CompoundRevenue from '@/components/Charts/CompoundRevenue/CompoundRevenue';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

type TimeRange = '7B' | '30B' | '90B' | '180B';
type BarSize = 'D' | 'W' | 'M';

const CompoundRevenueBlock = () => {
  const [compoundRevenueTab, setCompoundRevenueTab] = useState<TimeRange>('7B');
  const [revenueBarSize, setRevenueBarSize] = useState<BarSize>('D');

  const fullFiveYearData = useMemo(() => {
    const data = [];
    const startDate = new Date('2020-01-01');
    const endDate = new Date('2025-06-24');
    let baseValue = 50000;

    const quarterMultipliers = [1, 1.1, 0.9, 1.2];
    const dayMultipliers = [1, 1, 1, 1, 1, 0.7, 0.7];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const quarter = Math.floor(d.getMonth() / 3);
      const dayOfWeek = d.getDay();

      const value = Math.max(
        Math.round(
          baseValue *
            quarterMultipliers[quarter] *
            dayMultipliers[dayOfWeek] *
            (1 + (Math.random() - 0.5) * 0.3)
        ),
        10000
      );

      data.push({
        date: d.toISOString().split('T')[0],
        value
      });

      baseValue *= 1.0003;
    }

    return data;
  }, []);

  return (
    <Card
      title='Compound Revenue'
      className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
        <div className='flex gap-2'>
          <MultiSelect
            options={blockchains}
            onChange={() => {}}
            placeholder='Chain'
          />

          <MultiSelect
            options={blockchains}
            onChange={() => {}}
            placeholder='Market'
          />

          <MultiSelect
            options={blockchains}
            onChange={() => {}}
            placeholder='Source'
          />

          <MultiSelect
            options={blockchains}
            onChange={() => {}}
            placeholder='Reserve Symbols'
          />
        </div>

        <TabsGroup
          tabs={['D', 'W', 'M']}
          value={revenueBarSize}
          onTabChange={(value) => {
            if (value === 'D' || value === 'W' || value === 'M') {
              setRevenueBarSize(value);
            }
          }}
        />
        <TabsGroup
          tabs={['7B', '30B', '90B', '180B']}
          value={compoundRevenueTab}
          onTabChange={(value) => {
            if (
              value === '7B' ||
              value === '30B' ||
              value === '90B' ||
              value === '180B'
            ) {
              setCompoundRevenueTab(value);
            }
          }}
        />
      </div>

      <CompoundRevenue
        data={fullFiveYearData}
        barSize={revenueBarSize}
        barCount={Number(compoundRevenueTab.replace('B', ''))}
      />
    </Card>
  );
};

export default CompoundRevenueBlock;
