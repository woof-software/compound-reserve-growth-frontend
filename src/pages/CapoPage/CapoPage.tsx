import { CapoSpecificCollateralPrice } from '@/entities/Capo/CapoSpecificCollateralPrice/CapoSpecificCollateralPrice';
import { useNormalizedChartData } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/useNormalizedChartData';
import CapoCollateralsPriceBlock from '@/entities/Capo/CollateralPriceBlock/CapoCollateralsPriceBlock';
import { useNormalizedTableData } from '@/entities/Capo/CollateralPriceBlock/lib/useNormalizedTableData';
import { useScrollToHash } from '@/shared/hooks/useScrollToHash';
import Text from '@/shared/ui/Text/Text';

const CapoPage = () => {
  const { data, isError, isLoading } = useNormalizedTableData();
  const { chartData } = useNormalizedChartData();

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
          Track for Growth‑rate control that protects LST and LRT tokens from
          exchange‑rate manipulation
        </Text>
      </section>
      <section className='flex flex-col gap-2.5 md:gap-2.5 lg:gap-5'>
        <div className='grid gap-3'>
          <CapoCollateralsPriceBlock
            tableData={data}
            isError={isError}
            isLoading={isLoading}
          />
          <CapoSpecificCollateralPrice
            isError={isError}
            isLoading={isLoading}
            rawData={chartData}
          />
        </div>
      </section>
    </div>
  );
};

export default CapoPage;
