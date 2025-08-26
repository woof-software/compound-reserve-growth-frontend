import React, { useCallback, useMemo, useState } from 'react';

import MetricIncentivesBlock from '@/components/TreasuryPageTable/MetricIncentives';
import CurrentSpendingByChainBlock from '@/entities/Insentive/CurrentSpendingByChain';
import DailyExpenses from '@/entities/Insentive/DailyExpenses';
import HistoricalExpencesByNetworks from '@/entities/Insentive/HistoricalExpencesByNetworks';
import IncomeVsExpensesOnChainsAndMarkets from '@/entities/Insentive/IncomeVsExpensesOnChainsAndMarkets';
import { useScrollToHash } from '@/shared/hooks/useScrollToHash';
import { useTreasuryHistory } from '@/shared/hooks/useTreasuryHistory';
import {
  groupByKey,
  pick30DaysOldRecords,
  uniqByNestedAddresses
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

const InsentivePage = () => {
  const {
    data: treasuryApiResponse,
    isLoading,
    isError
  } = useTreasuryHistory({
    params: { order: 'DESC' }
  });

  const [tabValue, setTabValue] = useState<string>('Days');

  const treasuryData = useMemo<TokenData[]>(
    () => treasuryApiResponse || [],
    [treasuryApiResponse]
  );

  const uniqData = useMemo(() => {
    return uniqByNestedAddresses(treasuryData);
  }, [treasuryData]);

  const uniqData30DaysOld = useMemo(() => {
    return pick30DaysOldRecords(treasuryData, uniqData);
  }, [treasuryData, uniqData]);

  const uniqDataByCategory = useMemo(
    () => groupByKey(uniqData, (item) => item.source.asset.type),
    [uniqData]
  );

  const uniqData30DaysOldByCategory = useMemo(
    () => groupByKey(uniqData30DaysOld, (item) => item.source.asset.type),
    [uniqData30DaysOld]
  );

  const onTabsChange = useCallback((value: string) => {
    setTabValue(value);
  }, []);

  useScrollToHash(!isLoading);

  return (
    <div className='flex flex-col gap-6 md:gap-[42px] xl:gap-[70px]'>
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
          <div className='flex items-center justify-between'>
            <Text
              size='17'
              weight='500'
            >
              Daily Incentives
            </Text>
            <TabsGroup
              tabs={['Days', 'Year']}
              value={tabValue}
              onTabChange={onTabsChange}
            />
          </div>
          <MetricIncentivesBlock
            isLoading={isLoading}
            data={{
              uniqDataByCategory,
              uniqData30DaysOldByCategory
            }}
          />
        </div>
        <CurrentSpendingByChainBlock
          data={uniqData}
          isError={isError}
          isLoading={isLoading}
        />
        <HistoricalExpencesByNetworks
          isLoading={isLoading}
          isError={isError}
          data={treasuryData}
        />
        <IncomeVsExpensesOnChainsAndMarkets
          isLoading={isLoading}
          isError={isError}
          data={treasuryData}
        />
        <DailyExpenses
          data={uniqData}
          isError={isError}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default InsentivePage;
