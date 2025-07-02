import { useMemo } from 'react';

import MetricBlock from '@/entities/Treasury/MetricBlock';
import TotalTresuaryValue from '@/entities/Treasury/TotalTresuaryValue';
import TreasuryBalanceByNetworkBlock from '@/entities/Treasury/TreasuryBalanceByNetwork';
import TreasuryCompositionBlock from '@/entities/Treasury/TreasuryCompositionBlock';
import TreasuryHoldingsBlock from '@/entities/Treasury/TreasuryHoldingsBlock';
import { useTreasuryHistory } from '@/shared/hooks/useTreasuryHistory';
import {
  groupByKey,
  pick30DaysOldRecords,
  uniqByNestedAddresses
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import Text from '@/shared/ui/Text/Text';

const TreasuryPage = () => {
  const { data: treasuryApiResponse, isLoading } = useTreasuryHistory({
    params: { order: 'DESC' }
  });

  const treasuryData = useMemo<TokenData[]>(
    () => treasuryApiResponse?.data?.data || [],
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

  console.log('treasuryData=>', treasuryData);
  console.log('uniqData=>', uniqData);
  console.log('uniqData30DaysOld=>', uniqData30DaysOld);
  console.log('uniqDataByCategory=>', uniqDataByCategory);
  console.log('uniqData30DaysOldByCategory=>', uniqData30DaysOldByCategory);

  return (
    <div className='flex flex-col gap-[70px]'>
      <div className='flex flex-col gap-[15px]'>
        <Text
          tag='h1'
          size='32'
          weight='500'
        >
          Treasury
        </Text>

        <Text
          size='15'
          weight='400'
          className='text-primary-14'
        >
          Track Compound DAO&apos;s treasury portfolio including asset
          allocation, strategic holdings, and investment returns.
        </Text>
      </div>

      <div className='flex flex-col gap-5'>
        <MetricBlock
          isLoading={isLoading}
          data={{
            uniqDataByCategory,
            uniqData30DaysOldByCategory
          }}
        />

        <TreasuryCompositionBlock
          isLoading={isLoading}
          data={{
            uniqDataByCategory,
            uniqData
          }}
        />

        {/*add props*/}
        <TotalTresuaryValue />

        <TreasuryBalanceByNetworkBlock />

        <TreasuryHoldingsBlock />
      </div>
    </div>
  );
};

export default TreasuryPage;
