import React, { useMemo } from 'react';

import MetricBlock from '@/entities/Treasury/MetricBlock';
import TotalTresuaryValue from '@/entities/Treasury/TotalTresuaryValue';
import TreasuryBalanceByNetworkBlock from '@/entities/Treasury/TreasuryBalanceByNetwork';
import TreasuryCompositionBlock from '@/entities/Treasury/TreasuryCompositionBlock';
import TreasuryHoldingsBlock from '@/entities/Treasury/TreasuryHoldingsBlock';
import { useScrollToHash } from '@/shared/hooks/useScrollToHash';
import { useTreasuryHistory } from '@/shared/hooks/useTreasuryHistory';
import {
  groupByKey,
  pick30DaysOldRecords,
  uniqByNestedAddresses
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import Text from '@/shared/ui/Text/Text';

const TreasuryPage = () => {
  const {
    data: treasuryApiResponse,
    isLoading,
    isError
  } = useTreasuryHistory({
    params: { order: 'DESC' }
  });

  useScrollToHash(!isLoading);

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

  return (
    <div className='flex flex-col gap-6 md:gap-[42px] xl:gap-[70px]'>
      <div className='mt-5 flex flex-col gap-[15px] px-3 md:mt-0 md:px-0'>
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
          className='text-primary-14 leading-[140%] md:leading-[100%]'
        >
          Track Compound DAO&apos;s treasury portfolio including asset
          allocation, strategic holdings, and investment returns.
        </Text>
      </div>
      <div className='flex flex-col gap-2.5 md:gap-5'>
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
        <TotalTresuaryValue
          isLoading={isLoading}
          isError={isError}
          data={treasuryData}
        />
        <TreasuryBalanceByNetworkBlock
          data={uniqData}
          isError={isError}
          isLoading={isLoading}
        />
        <TreasuryHoldingsBlock
          data={uniqData}
          isError={isError}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default TreasuryPage;
