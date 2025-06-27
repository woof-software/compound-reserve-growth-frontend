import { useMemo, useState } from 'react';

import { blockchains, stackedChartData } from '@/components/Charts/chartData';
import CompoundFeeRecieved from '@/components/Charts/CompoundFeeRecieved/CompoundFeeRecieved';
import CompoundRevenue from '@/components/Charts/CompoundRevenue/CompoundRevenue';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import CompoundFeeRevenuebyChain from '@/components/RevenuePageTable/CompoundFeeRevenuebyChain';
import RevenueBreakdown from '@/components/RevenuePageTable/RevenueBreakdown';
import RevenueOverviewUSD from '@/components/RevenuePageTable/RevenueOverviewUSD';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';
import ValueMetricField from '@/shared/ui/ValueMetricField/ValueMetricField';

type TimeRange = '7B' | '30B' | '90B' | '180B';
type BarSize = 'D' | 'W' | 'M';

type OptionType = { id: string; label: string };

const RevenuePage = () => {
  const [compoundRevenueTab, setCompoundRevenueTab] = useState<TimeRange>('7B');
  const [revenueBarSize, setRevenueBarSize] = useState<BarSize>('D');

  const [feeRecievedTab, setFeeRecievedTab] = useState<TimeRange>('7B');
  const [feeRecievedBarSize, setFeeRecievedBarSize] = useState<BarSize>('D');

  const [selectedChains, setSelectedChains] = useState<OptionType[]>([]);

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

  const yearlyTotals = useMemo(() => {
    const totals: Record<string, { total: number; growth: number }> = {};

    fullFiveYearData.forEach(({ date, value }) => {
      const year = date.substring(0, 4);
      totals[year] = totals[year] || { total: 0, growth: 0 };
      totals[year].total += value;
    });

    Object.keys(totals)
      .sort()
      .reduce((prevYear, year) => {
        if (prevYear && totals[prevYear]) {
          totals[year].growth =
            (totals[year].total / totals[prevYear].total - 1) * 100;
        }
        return year;
      }, '');

    return totals;
  }, [fullFiveYearData]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    return `${value.toLocaleString()}`;
  };

  const formatGrowth = (growth: number) => {
    if (growth === 0) return '-';
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  const handleChainChange = (selectedOptions: OptionType[]) => {
    setSelectedChains(selectedOptions);
  };

  return (
    <div className='flex flex-col gap-[70px]'>
      <div className='flex flex-col gap-[15px]'>
        <Text
          tag='h1'
          size='32'
          weight='500'
        >
          Revenue
        </Text>
        <Text
          tag='p'
          size='15'
          className='text-primary-14'
        >
          Track Compound Protocol revenue streams across various networks.
        </Text>
      </div>

      <div className='flex flex-col gap-5'>
        <div className='flex flex-row gap-5'>
          {['2021', '2022', '2023', '2024'].map((year) => (
            <Card
              key={year}
              className={{ container: 'flex-1' }}
              title={`${year} Revenue`}
            >
              <div className='flex flex-col gap-8'>
                <ValueMetricField
                  value={formatCurrency(yearlyTotals[year]?.total || 0)}
                  label='Total Revenue'
                />
                <ValueMetricField
                  value={formatGrowth(yearlyTotals[year]?.growth || 0)}
                  label='YoY Growth'
                />
              </div>
            </Card>
          ))}
        </div>

        <Card
          title='Revenue Overview USD'
          className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
        >
          <div className='flex gap-3 px-0 py-3'>
            <TabsGroup
              tabs={['7D', '30D', '90D']}
              defaultTab='7D'
            />
            <TabsGroup
              tabs={['Rolling', 'To Date']}
              defaultTab='Rolling'
            />
          </div>
          <RevenueOverviewUSD />
        </Card>

        <Card
          title='Compound Cumulative Revenue'
          className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
        >
          <div className='flex gap-3 px-0 py-3'>
            <TabsGroup
              tabs={['7B', '30B', '90B']}
              defaultTab='7B'
            />
          </div>
          qwe
        </Card>

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

        <Card
          title='Compound Fee Revenue by Chain'
          className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
        >
          <div className='flex gap-3 px-0 py-3'>Interval Year</div>
          <CompoundFeeRevenuebyChain />
        </Card>

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

        <Card
          title='Revenue Breakdown'
          className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
        >
          <div className='flex gap-3 px-0 py-3'>Year btn</div>
          <RevenueBreakdown />
        </Card>
      </div>
    </div>
  );
};

export default RevenuePage;
