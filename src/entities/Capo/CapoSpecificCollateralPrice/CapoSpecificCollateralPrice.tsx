import React from 'react';
import { CSVLink } from 'react-csv';

import Line from '@/components/Charts/Line/Line';
import Filter, { FilterOptions } from '@/components/Filter/Filter';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import {
  customFormatter,
  customOptions
} from '@/entities/Capo/CapoSpecificCollateralPrice/lib/chartConfig';
import { getCsvDataNormalizer } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/getCsvData';
import { useChartFilters } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/useChartFilters';
import { useCollateralChartData } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/useCollateralChartData';
import { useRelativeFilters } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/useRelativeFilters';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useFilterSyncSingle } from '@/shared/hooks/useFiltersSync';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { useModal } from '@/shared/hooks/useModal';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import { CapoNormalizedChartData } from '@/shared/types/Capo/types';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import SingleSelect from '@/shared/ui/SingleSelect/SingleSelect';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

interface CapoSpecificCollateralPriceProps {
  rawData: CapoNormalizedChartData[];
  isLoading?: boolean;
  isError?: boolean;
}

export const CapoSpecificCollateralPrice = (
  props: CapoSpecificCollateralPriceProps
) => {
  const { rawData, isLoading, isError } = props;

  const {
    selectedChain,
    selectedCollateral,
    setSelectedChain,
    setSelectedCollateral,
    chainOptions,
    collateralOptions,
    filteredData,
    groupBy
  } = useChartFilters(rawData);

  const {
    isOpen: isFilterOpen,
    onOpenModal: onFilterOpen,
    onCloseModal: onFilterClose
  } = useModal();

  const {
    isOpen: isMoreOpen,
    onOpenModal: onMoreOpen,
    onCloseModal: onMoreClose
  } = useModal();

  /**
   * A variable holding filter configurations for mobile devices.
   * The bridge between useChartFilters and Filter component.
   */
  const mobileFilters = ((): FilterOptions[] => {
    return [
      {
        id: 'chain',
        placeholder: 'Chain',
        total: chainOptions.length,
        options: chainOptions,
        selectedOptions: selectedChain ? [selectedChain] : [],
        disableSelectAll: true,
        onChange: (options) => {
          /**
           * The Filter component throws the selected filter as the latest one,
           * so it is used to implement a 'single' element behavior
           */
          const option = options.at(-1);

          if (!option) return;

          setSelectedChain(option);
        }
      },
      {
        id: 'collateral',
        placeholder: 'Collaterals',
        total: chainOptions.length,
        options: collateralOptions,
        selectedOptions: selectedCollateral ? [selectedCollateral] : [],
        disableSelectAll: true,
        onChange: (options) => {
          /**
           * The Filter component throws the selected filter as the latest one,
           * so it is used to implement a 'single' element behavior
           */
          const option = options.at(-1);

          if (!option) return;

          setSelectedCollateral(option);
        }
      }
    ];
  })();

  const { barSize, onBarSizeChange } = useChartControls({
    initialBarSize: 'D'
  });

  const { chartSeries, hasData } = useCollateralChartData({
    rawData: filteredData
  });

  useFilterSyncSingle(
    'capoSpecificCollateralPriceChain',
    selectedChain?.id,
    setSelectedChain
  );

  useFilterSyncSingle(
    'capoSpecificCollateralPriceCollateral',
    selectedCollateral?.id,
    setSelectedCollateral
  );

  useRelativeFilters({
    collaterals: collateralOptions,
    chains: chainOptions,
    chain: selectedChain,
    onCollateralSelect: setSelectedCollateral,
    onChainSelect: setSelectedChain
  });

  const csvData = getCsvDataNormalizer(chartSeries, barSize);

  const { aggregatedSeries } = useLineChart({
    groupBy: groupBy(),
    data: chartSeries,
    barSize
  });

  const resetFilters = () => {
    const firstChain = chainOptions[0];

    if (!firstChain) return;

    setSelectedChain(firstChain);
  };

  return (
    <Card
      id='specific-collateral-price-against-price-restriction'
      title={'Specific Collateral Price against Price Restriction'}
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-5 md:px-5 lg:px-10 lg:pb-10'
      }}
    >
      <div className='hidden items-center justify-end gap-2 px-10 py-3 lg:flex lg:px-0'>
        <TabsGroup
          className={{
            container: 'w-full sm:w-auto',
            list: 'w-full sm:w-auto'
          }}
          tabs={['D', 'W', 'M']}
          value={barSize}
          onTabChange={onBarSizeChange}
        />
        <SingleSelect
          options={chainOptions}
          value={selectedChain}
          onChange={setSelectedChain}
          placeholder='Chain'
        />
        <SingleSelect
          options={collateralOptions}
          value={selectedCollateral}
          onChange={setSelectedCollateral}
          placeholder='Collateral'
        />
        <CSVDownloadButton
          data={csvData}
          filename={getCsvFileName('capo_specific_collateral_price')}
        />
      </div>
      <div className='block lg:hidden'>
        <div className='flex w-full items-center justify-end gap-2 px-5 py-3 sm:w-auto'>
          <TabsGroup
            className={{
              container: 'w-full sm:w-auto',
              list: 'w-full sm:w-auto'
            }}
            tabs={['D', 'W', 'M']}
            value={barSize}
            onTabChange={onBarSizeChange}
          />
          <Button
            onClick={onFilterOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-1/2 min-w-32 gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8'
          >
            <Icon
              name='filters'
              className='h-3.5 w-3.5 fill-none'
            />
            Filters
          </Button>
          <Button
            onClick={onMoreOpen}
            className='bg-secondary-27 shadow-13 flex h-9 min-w-9 rounded-lg sm:w-auto md:h-8 md:min-w-8 lg:hidden'
          >
            <Icon
              name='3-dots'
              className='h-6 w-6 fill-none'
            />
          </Button>
        </div>
        <Filter
          isOpen={isFilterOpen}
          filterOptions={mobileFilters}
          onClose={onFilterClose}
          disableClearFilters
        />
        <Drawer
          isOpen={isMoreOpen}
          onClose={onMoreClose}
        >
          <Text
            size='17'
            weight='700'
            align='center'
            className='mb-5'
          >
            Actions
          </Text>
          <div className='flex flex-col gap-1.5'>
            <div className='px-3 py-2'>
              <CSVLink
                data={csvData}
                filename={getCsvFileName('capo_specific_collateral_price')}
                onClick={onMoreClose}
              >
                <div className='flex items-center gap-1.5'>
                  <Icon
                    name='download'
                    className='h-6.5 w-6.5'
                  />
                  <Text
                    size='14'
                    weight='500'
                  >
                    CSV with the entire historical data
                  </Text>
                </div>
              </CSVLink>
            </div>
          </div>
        </Drawer>
      </div>
      {hasData && (
        <Line
          key={groupBy()}
          groupBy={groupBy()}
          aggregatedSeries={aggregatedSeries}
          className='max-h-fit'
          // @ts-expect-error TODO: fix context type for Line component customTooltipFormatter
          customTooltipFormatter={customFormatter}
          customOptions={customOptions}
        />
      )}
      {!hasData && (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            color: '#666'
          }}
        >
          <NoDataPlaceholder onButtonClick={resetFilters} />
        </div>
      )}
    </Card>
  );
};
