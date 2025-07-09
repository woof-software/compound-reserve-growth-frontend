import { useMemo } from 'react';
import * as React from 'react';

import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import Filter from '@/components/Filter/Filter';
import { useFilter } from '@/components/Filter/useFilter';
import { TreasuryHolding } from '@/components/TreasuryPageTable/MOCK_DATA';
import TreasuryHoldings from '@/components/TreasuryPageTable/TreasuryHoldings';
import {
  capitalizeFirstLetter,
  extractFilterOptions
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import Card from '@/shared/ui/Card/Card';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

interface TreasuryHoldingsBlockProps {
  isLoading?: boolean;
  isError?: boolean;
  data: TokenData[];
}

const mapTableData = (data: TokenData[]): TreasuryHolding[] => {
  return data.map((el) => {
    const decimals = el.source.asset.decimals || 0;
    const rawQuantity = Number(el.quantity) || 0;
    const humanReadableQuantity = rawQuantity / 10 ** decimals;

    return {
      symbol: el.source.asset.symbol,
      chain: capitalizeFirstLetter(el.source.network),
      market: el.source.market ?? 'no market',
      qty: humanReadableQuantity,
      value: el.value,
      price: el.price,
      source: el.source.type
    };
  });
};

const TreasuryHoldingsBlock = ({
  isLoading,
  isError,
  data
}: TreasuryHoldingsBlockProps) => {
  const { local, selected, toggle, apply, clear, reset } = useFilter();

  const activeCount = useMemo(
    () =>
      selected.reduce((acc, filter) => acc + filter.selectedItems.length, 0),
    [selected]
  );

  const filterOptionsConfig = useMemo(
    () => ({
      chain: { path: 'source.network' },
      assetType: { path: 'source.asset.type' },
      deployment: { path: 'source.market' }
    }),
    []
  );

  const { chainOptions, assetTypeOptions, deploymentOptions } = useMemo(
    () => extractFilterOptions(data, filterOptionsConfig),
    [data, filterOptionsConfig]
  );

  const filtersList = useMemo(
    () => [
      {
        id: 'chain',
        title: 'Chain',
        placeholder: 'Add Chain',
        options: chainOptions?.map((o) => capitalizeFirstLetter(o.id)) || []
      },
      {
        id: 'assetType',
        title: 'Asset Type',
        placeholder: 'Add Asset Type',
        options: assetTypeOptions?.map((o) => o.id) || []
      },
      {
        id: 'deployment',
        title: 'Deployment',
        placeholder: 'Add Deployment',
        options: deploymentOptions?.map((o) => o.id) || []
      }
    ],
    [chainOptions, assetTypeOptions, deploymentOptions]
  );

  const filterProps = useMemo(
    () => ({
      activeFilters: activeCount,
      selectedItems: local,
      filtersList: filtersList,
      onFilterItemSelect: toggle,
      onApply: apply,
      onClear: clear,
      onOutsideClick: reset
    }),
    [activeCount, local, toggle, apply, clear, reset, filtersList]
  );

  const tableData = useMemo<TreasuryHolding[]>(() => {
    const selectedData = data.filter((item) =>
      selected.every(({ id, selectedItems }) => {
        if (!selectedItems.length) return true;

        let fieldValue: string;

        switch (id) {
          case 'chain':
            fieldValue = capitalizeFirstLetter(item.source.network);
            break;

          case 'assetType':
            fieldValue = item.source.asset.type;
            break;

          case 'deployment':
            fieldValue = item.source.market || 'no market';
            break;

          default:
            return true;
        }

        return selectedItems.includes(fieldValue);
      })
    );

    return mapTableData(selectedData);
  }, [data, selected]);

  return (
    <Card
      isError={isError}
      isLoading={isLoading}
      title='Full Treasury Holdings'
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[458.5px] overflow-visible',
        content: 'rounded-b-lg pt-0',
        header: 'rounded-t-lg'
      }}
    >
      <div className='flex items-center justify-end gap-3 px-0 py-3'>
        <Filter {...filterProps} />
        <CSVDownloadButton
          data={tableData}
          filename='Full Treasury Holdings'
        />
      </div>
      <View.Condition if={Boolean(!isLoading && !isError && tableData.length)}>
        <TreasuryHoldings tableData={tableData} />
      </View.Condition>
      <View.Condition if={Boolean(!isLoading && !isError && !tableData.length)}>
        <div className='flex h-[400px] items-center justify-center'>
          <Text
            size='12'
            className='text-primary-14'
          >
            No data for selected filters
          </Text>
        </div>
      </View.Condition>
    </Card>
  );
};

export default TreasuryHoldingsBlock;
