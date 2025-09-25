import { useNormalizedTableData } from '@/components/CapoPageTable/lib/useNormalizedTableData';
import CollateralsPriceBlock from '@/entities/Capo/CollateralPriceBlock/CollateralsPriceBlock';
import { useScrollToHash } from '@/shared/hooks/useScrollToHash';
import Text from '@/shared/ui/Text/Text';

const CapoPage = () => {
  const { data, isError, isLoading } = useNormalizedTableData();

  useScrollToHash(!isLoading);

  return (
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
            tableData={data}
            isError={isError}
            isLoading={isLoading}
          />
          {/*<SpecificCollateralPrice*/}
          {/*  isLoading={isLoading}*/}
          {/*  isError={isError}*/}
          {/*  data={treasuryData}*/}
          {/*/>*/}
        </div>
      </section>
    </div>
  );
};

export default CapoPage;
