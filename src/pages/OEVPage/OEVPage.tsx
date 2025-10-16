import React, { useMemo } from 'react';

import MetricBlock from '@/entities/OEV/MetricBlock';
import CapturedFeesByNetworkAndMarket from '@/features/OEV/CapturedFeesByNetworkAndMarket';
import PresenceByMarketAndCollateral from '@/features/OEV/PresenceByMarketAndCollateral';
import ReturnedFeesToTheCompoundProtocol from '@/features/OEV/ReturnedFeesToTheCompoundProtocol';
import { useScrollToHash } from '@/shared/hooks/useScrollToHash';
import { useTreasuryHistory } from '@/shared/hooks/useTreasuryHistory';
import {
  groupByKey,
  pick30DaysOldRecords,
  uniqByNestedAddresses
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import Text from '@/shared/ui/Text/Text';

const OEVPage = () => {
  const {
    data: treasuryApiResponse,
    isLoading,
    isError
  } = useTreasuryHistory({
    params: { order: 'DESC' }
  });

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

  useScrollToHash(!isLoading);

  return (
    <div className='flex flex-col gap-6 md:gap-[40px] xl:gap-[50px]'>
      <section className='mt-5 flex flex-col gap-[15px] px-3 md:mt-0 md:px-0'>
        <Text
          tag='h1'
          size='32'
          weight='500'
        >
          OEV
        </Text>
        <Text
          size='15'
          weight='400'
          className='text-primary-14 leading-[140%] md:leading-[100%]'
        >
          Track Compound DAO&apos;s treasury portfolio including asset
          allocation, strategic holdings, and investment returns.
        </Text>
      </section>
      <section className='flex flex-col gap-2.5 md:gap-2.5 lg:gap-5'>
        <Text
          size='17'
          weight='500'
        >
          Annual OEV fees
        </Text>
        <MetricBlock
          isLoading={isLoading}
          data={{
            uniqDataByCategory,
            uniqData30DaysOldByCategory
          }}
        />
        <PresenceByMarketAndCollateral
          data={uniqData}
          isError={isError}
          isLoading={isLoading}
        />
        <CapturedFeesByNetworkAndMarket
          data={uniqData}
          isError={isError}
          isLoading={isLoading}
        />
        <ReturnedFeesToTheCompoundProtocol
          data={uniqData}
          isError={isError}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
};

export default OEVPage;
