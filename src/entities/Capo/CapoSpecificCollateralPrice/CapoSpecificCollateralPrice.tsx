import { useProcessor } from '@/shared/hooks/useProcessor';
import { useEffect, useMemo } from 'react';
import { useQueryState } from 'nuqs';

import { ChartActions } from '@/components/Charts/ChartActions';
import Line from '@/components/Charts/Line/Line';
import { DropdownFilterSingle } from '@/components/Filter/DropdownFilter/DropdownFilterSingle';
import { Filters } from '@/components/Filter/Filters';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import { customFormatter, customOptions } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/chartConfig';
import { getCsvData } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/getCsvData';
import { useCollateralChartData } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/useCollateralChartData';
import { CapoEventBusEventsContext } from '@/entities/Capo/lib/CapoEventBusContext';
import { useBarSize } from '@/shared/hooks/useBarSize';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import { capitalizeFirstLetter } from '@/shared/lib/utils/utils';
import { CapoNormalizedChartData } from '@/shared/types/Capo/types';
import { BAR_SIZE } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

interface CapoSpecificCollateralPriceProps {
  rawData: CapoNormalizedChartData[];
  isLoading?: boolean;
  isError?: boolean;
}

export const CapoSpecificCollateralPrice = ({
  rawData,
  isLoading,
  isError
}: CapoSpecificCollateralPriceProps) => {
  const [selectedChainKey, setSelectedChainKey] = useQueryState('cscp-chain', {defaultValue: 'mainnet'});
  const [selectedCollateralKey, setSelectedCollateralKey] = useQueryState('cscp-collateral', {defaultValue: 'mETH'});

  const capoEvents = CapoEventBusEventsContext.use();

  useEffect(() => {
    return capoEvents.on('on-collateral-select', ({ collateral, network }) => {
      setSelectedChainKey(network);
      setSelectedCollateralKey(collateral);
    });
  }, [capoEvents, setSelectedChainKey, setSelectedCollateralKey]);

  const { barSize, onBarSizeChange } = useBarSize({ initialBarSize: BAR_SIZE.D });

  const chainOptions = useMemo(() => (
    [...new Set(rawData.map((item) => item.network))]
      .map((network) => ({ label: capitalizeFirstLetter(network), value: network }))
  ), [rawData]);

  const selectedChainOption = useMemo(() => {
    if (chainOptions.length) {
      const selectedElement = chainOptions.find(({value}) => value === selectedChainKey);

      if (!selectedElement) throw new Error('Selected chain option not found in chainOptions');

      return selectedElement;
    }

    return chainOptions[0];
  }, [chainOptions, selectedChainKey]);

  const collateralOptions = useMemo(() => (
    [...new Set(rawData.map((item) => item.collateral))]
      .map((collateral) => ({ label: collateral, value: collateral }))
  ), [rawData]);

  const selectedCollateralOption = useMemo(() => {
    if (collateralOptions.length) {
      const selectedElement = collateralOptions?.find(({value}) => value === selectedCollateralKey);

      if (!selectedElement) throw new Error('Selected collateral option not found in collateralOptions');

      return selectedElement;
    }

    return collateralOptions[0];
  }, [collateralOptions, selectedCollateralKey]);

  const { result: filteredData } = useProcessor({
    array: rawData,
    filters: [
      (v) => v.network === selectedChainKey,
      (v) => v.collateral === selectedCollateralKey,
    ],
    transformer: () => {
      const filtered: CapoNormalizedChartData[] = [];

      return (v: CapoNormalizedChartData) => {
        filtered.push(v);
        return filtered;
      };
    },
  });

  const groupBy = `${selectedChainKey}-${selectedCollateralKey}`;

  const { chartSeries, hasData } = useCollateralChartData({ rawData: filteredData });

  const { aggregatedSeries } = useLineChart({ groupBy, data: chartSeries, barSize });

  return (
    <Card
      id='specific-collateral-price-against-price-restriction'
      title='Specific Collateral Price against Price Restriction'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-5 md:px-5 lg:px-10 lg:pb-10'
      }}
    >
      <div className='flex items-center gap-2 md:px-0 px-5 py-3 justify-end'>
        <TabsGroup
          className={{
            container: 'w-full sm:w-auto',
            list: 'w-full sm:w-auto'
          }}
          tabs={['D', 'W', 'M']}
          value={barSize}
          onTabChange={onBarSizeChange}
        />
        <div className={'flex w-full sm:w-auto'}>
          <Filters isShowClear={false}>
            <DropdownFilterSingle
              triggerLabel={'Chain'}
              options={chainOptions}
              getKey={(v) => v.value}
              getLabel={(v) => v.label}
              value={selectedChainOption}
              setValue={({value}) => setSelectedChainKey(value)}
              prefix={selectedChainOption?.label}
            />
            <DropdownFilterSingle
              triggerLabel={'Collateral'}
              options={collateralOptions}
              getKey={(v) => v.value}
              getLabel={(v) => v.label}
              value={selectedCollateralOption}
              setValue={({value}) => setSelectedCollateralKey(value)}
              prefix={selectedCollateralOption?.label}
            />
          </Filters>
        </div>
        <ChartActions
          mobileChildren={
            <CSVDownloadButton
              data={getCsvData(chartSeries, barSize)}
              filename={getCsvFileName('capo_specific_collateral_price')}
            />
          }
        >
          <CSVDownloadButton
            data={getCsvData(chartSeries, barSize)}
            filename={getCsvFileName('capo_specific_collateral_price')}
          />
        </ChartActions>
      </div>
      {hasData && (
        <Line
          key={groupBy}
          groupBy={groupBy}
          aggregatedSeries={aggregatedSeries}
          className='max-h-fit'
          customTooltipFormatter={customFormatter}
          customOptions={customOptions}
        />
      )}
      {!hasData && (
        <NoDataPlaceholder />
      )}
    </Card>
  );
};