import * as React from 'react';
import { useEffect, useMemo } from 'react';

import CryptoChart from '@/components/Charts/Bar/Bar';
import Filter from '@/components/Filter/Filter';
import { useFilter } from '@/components/Filter/useFilter';
import TreasuryBalanceByNetwork, {
  TreasuryBalanceByNetworkType
} from '@/components/TreasuryPageTable/TreasuryBalanceByNetwork';
import {
  capitalizeFirstLetter,
  colorPicker,
  extractFilterOptions
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import Card from '@/shared/ui/Card/Card';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

interface TreasuryBalanceByNetworkBlockProps {
  isLoading?: boolean;

  isError?: boolean;

  data: TokenData[];
}

const mapTableData = (data: TokenData[]): TreasuryBalanceByNetworkType[] => {
  return data.map((el) => ({
    symbol: el.source.asset.symbol,

    qty: Number(el.quantity) || 0,

    value: el.value,

    source: el.source.type,

    market: el.source.market
  }));
};

const TreasuryBalanceByNetworkBlock = ({
  isLoading,

  isError,

  data
}: TreasuryBalanceByNetworkBlockProps) => {
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

  const { local, selected, toggle, apply, clear, reset } = useFilter();

  const activeCount = useMemo(
    () =>
      selected.reduce((acc, filter) => acc + filter.selectedItems.length, 0),
    [selected]
  );

  const filterProps = useMemo(
    () => ({
      activeFilters: activeCount,
      selectedItems: local,
      filtersList,
      onFilterItemSelect: toggle,
      onApply: apply,
      onClear: clear,
      onOutsideClick: reset
    }),
    [activeCount, local, toggle, apply, clear, reset, filtersList]
  );

  const tableData = useMemo<TreasuryBalanceByNetworkType[]>(() => {
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
            fieldValue = item.source.market;
            break;

          default:
            return true;
        }

        return selectedItems.includes(fieldValue);
      })
    );

    return mapTableData(selectedData);
  }, [data, selected]);

  const chartData = useMemo(() => {
    return tableData.map((item, index) => ({
      name: item.symbol,

      value: item.value,

      color: colorPicker(index)
    }));
  }, [tableData]);

  useEffect(() => {
    if (filtersList[0].options.length > 0) {
      toggle(filtersList[0].id, filtersList[0].options[0]);

      apply();
    }
  }, [filtersList]);

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Treasury Balance by Network'
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[458.5px] overflow-visible',
        header: 'rounded-t-lg',
        content: 'flex flex-col gap-3 rounded-b-lg px-10 pt-0 pb-10'
      }}
    >
      <div className='flex items-center justify-end gap-3 px-0 py-3'>
        <Filter {...filterProps} />
      </div>
      <View.Condition if={Boolean(!isLoading && !isError && tableData.length)}>
        <div className='flex justify-between gap-10'>
          <CryptoChart data={chartData} />
          <TreasuryBalanceByNetwork tableData={tableData} />
        </div>
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

export default TreasuryBalanceByNetworkBlock;
