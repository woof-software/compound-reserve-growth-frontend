import { useEffect, useMemo } from 'react';

import CryptoChart from '@/components/Charts/Bar/Bar';
import Filter from '@/components/Filter/Filter';
import { useFilter } from '@/components/Filter/useFilter';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
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
import View from '@/shared/ui/View/View';

interface TreasuryBalanceByNetworkBlockProps {
  isLoading?: boolean;
  isError?: boolean;
  data: TokenData[];
}

const mapTableData = (data: TokenData[]): TreasuryBalanceByNetworkType[] => {
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
      source: el.source.type,
      address: el.source.address
    };
  });
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
        title: 'Market',
        placeholder: 'Add Market',
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
            fieldValue = item.source.market ?? 'no market';
            break;

          default:
            return true;
        }

        return selectedItems.includes(fieldValue);
      })
    );

    return mapTableData(selectedData).sort((a, b) => b.value - a.value);
  }, [data, selected]);

  const chartData = useMemo(() => {
    return tableData
      .map((item, index) => ({
        name: item.symbol,
        value: item.value,
        color: colorPicker(index)
      }))
      .filter((el) => el.value > 0);
  }, [tableData]);

  useEffect(() => {
    if (selected.length === 0 && filtersList[0]?.options.length > 0) {
      const defaultChain = filtersList[0].options.find(
        (opt) => opt === 'Mainnet'
      );
      if (defaultChain) {
        toggle(filtersList[0].id, defaultChain);
        apply();
      }
    }
  }, [filtersList, selected, toggle, apply]);

  console.log('tableData=>', tableData);

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Treasury Balance by Network'
      id='treasury-balance-by-network'
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
        <NoDataPlaceholder onButtonClick={clear} />
      </View.Condition>
    </Card>
  );
};

export default TreasuryBalanceByNetworkBlock;
