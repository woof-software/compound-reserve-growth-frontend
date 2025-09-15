import React, { useMemo } from 'react';

import SpecificCollateralPrice from '@/components/CapoPageTable/SpecificCollateralPrice';
import CollateralsPriceBlock from '@/entities/Capo/CollateralsPriceBlock';
import { useTreasuryHistory } from '@/entities/Treasury';
import { useScrollToHash } from '@/shared/hooks';
import { uniqByNestedAddresses } from '@/shared/lib/utils';
import { TokenData } from '@/shared/types';
import { Text } from '@/shared/ui/atoms';
import { Page } from '@/shared/ui/atoms/Page';

const CapoPage = () => {
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

  useScrollToHash(!isLoading);

  return (
    <Page>
      <div className='flex flex-col gap-6 md:gap-[40px] xl:gap-[50px]'>
        <section className='mt-5 flex flex-col gap-[15px] px-3 md:mt-0 md:px-0'>
          <Text
            tag='h1'
            size='32'
            weight='500'
          >
            CAPO
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
          <div className='grid gap-3'>
            <CollateralsPriceBlock
              data={uniqData}
              isError={isError}
              isLoading={isLoading}
            />
            <SpecificCollateralPrice
              isLoading={isLoading}
              isError={isError}
              data={treasuryData}
            />
          </div>
        </section>
      </div>
    </Page>
  );
};

export default CapoPage;
