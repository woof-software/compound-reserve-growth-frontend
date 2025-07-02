import { useMemo } from 'react';

import MetricBlock from '@/entities/Treasury/MetricBlock';
import TotalTresuaryValue from '@/entities/Treasury/TotalTresuaryValue';
import TreasuryBalanceByNetworkBlock from '@/entities/Treasury/TreasuryBalanceByNetwork';
import TreasuryCompositionBlock from '@/entities/Treasury/TreasuryCompositionBlock';
import TreasuryHoldingsBlock from '@/entities/Treasury/TreasuryHoldingsBlock';
import { useTreasuryHistory } from '@/shared/hooks/useTreasuryHistory';
import { TreasuryData } from '@/shared/types/Treasury/types';
import Text from '@/shared/ui/Text/Text';

const TreasuryPage = () => {
  const { data: treasuryApiResponse, isLoading } = useTreasuryHistory({
    params: { order: 'DESC' }
  });

  const treasuryData = useMemo<TreasuryData[]>(
    () => treasuryApiResponse?.data?.data || [],
    [treasuryApiResponse]
  );

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
          data={treasuryData}
        />

        <TreasuryCompositionBlock />

        <TotalTresuaryValue />

        <TreasuryBalanceByNetworkBlock />

        <TreasuryHoldingsBlock />
      </div>
    </div>
  );
};

export default TreasuryPage;
