import { useState } from 'react';

import HistoricalExpensesByNetworks from '@/entities/Insentive/HistoricalExpensesByNetwork/HistoricalExpensesByNetworks';
import MetricBlock from '@/entities/Insentive/MetricBlock/MetricBlock';
import CurrentSpendingByChainBlock from '@/features/Insentive/CurrentSpendingByChain';
import { useIncentivesApiData } from '@/shared/hooks/useIncentivesApiData';
import { useSourceCombinator } from '@/shared/hooks/useSourceCombinator';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

const IncentivePage = () => {
  const [activeTab, setActiveTab] = useState<string>('Day');
  const incentivesQuery = useIncentivesApiData();

  const combinedIncentivesData = useSourceCombinator(
    incentivesQuery?.data,
    (item, { sourcesMap }) => {
      const { sourceId, ...options } = item;
      const source = sourcesMap.get(sourceId);
      if (!source) {
        return null;
      }
      return { ...options, source };
    }
  );

  return (
    <div className='flex flex-col gap-6 md:gap-[40px] xl:gap-[50px]'>
      <div className='mt-5 flex flex-col gap-[15px] px-3 md:mt-0 md:px-0'>
        <Text
          tag='h1'
          size='32'
          weight='500'
        >
          Incentives
        </Text>
        <Text
          size='15'
          weight='400'
          className='text-primary-14 leading-[140%] md:leading-[100%]'
        >
          Track Compound DAO&apos;s treasury portfolio including asset
          allocation, strategic holdings, and investment returns.
        </Text>
      </div>
      <div className='flex flex-col gap-2.5 md:gap-2.5 lg:gap-5'>
        <div className='grid gap-3'>
          <div className='flex items-center justify-between px-3'>
            <Text
              size='17'
              weight='500'
            >
              {activeTab === 'Day' ? 'Daily' : 'Yearly'} Incentives
            </Text>
            <TabsGroup
              tabs={['Day', 'Year']}
              value={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          <MetricBlock
            activeTab={activeTab}
            data={combinedIncentivesData}
            isLoading={incentivesQuery.isPending}
          />
        </div>
        <CurrentSpendingByChainBlock
          data={combinedIncentivesData}
          isError={incentivesQuery?.isError}
          isLoading={incentivesQuery?.isPending}
        />
        <HistoricalExpensesByNetworks
          data={combinedIncentivesData}
          isError={incentivesQuery?.isError}
          isLoading={incentivesQuery?.isPending}
        />
        {/*<FeesGeneratedVsIncentives*/}
        {/*  isLoading={isLoading}*/}
        {/*  isError={isError}*/}
        {/*  data={treasuryData}*/}
        {/*/>*/}
        {/*<DailyExpenses*/}
        {/*  data={uniqData}*/}
        {/*  isError={isError}*/}
        {/*  isLoading={isLoading}*/}
        {/*/>*/}
      </div>
    </div>
  );
};

export default IncentivePage;
