import React, { useCallback, useMemo, useReducer } from 'react';

import CryptoChart from '@/components/Charts/Bar/Bar';
import { MultiSelect, Option } from '@/components/MultiSelect/MultiSelect';
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
import { OptionType } from '@/shared/types/types';
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
  const [selectedOptions, setSelectedOptions] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    {
      chain: [{ id: 'mainnet', label: 'Mainnet' }],
      assetType: [],
      deployment: []
    }
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

  const deploymentOptionsFilter = useMemo(() => {
    const marketV2 =
      deploymentOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v2')
        .sort((a: OptionType, b: OptionType) =>
          a.label.localeCompare(b.label)
        ) || [];

    const marketV3 =
      deploymentOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v3')
        .sort((a: OptionType, b: OptionType) =>
          a.label.localeCompare(b.label)
        ) || [];

    const noMarkets = deploymentOptions?.find(
      (el) => el?.id?.toLowerCase() === 'no name'
    );

    if (noMarkets) {
      return [...marketV3, ...marketV2, noMarkets];
    }

    return [...marketV3, ...marketV2];
  }, [deploymentOptions]);

  const tableData = useMemo<TreasuryBalanceByNetworkType[]>(() => {
    const filtered = data.filter((item) => {
      if (
        selectedOptions.chain.length > 0 &&
        !selectedOptions.chain.some((o) => o.id === item.source.network)
      ) {
        return false;
      }

      if (
        selectedOptions.assetType.length > 0 &&
        !selectedOptions.assetType.some(
          (o: OptionType) => o.id === item.source.asset.type
        )
      ) {
        return false;
      }

      const market = item.source.market ?? 'no market';

      return !(
        selectedOptions.deployment.length > 0 &&
        !selectedOptions.deployment.some((o: OptionType) => o.id === market)
      );
    });

    return mapTableData(filtered).sort((a, b) => b.value - a.value);
  }, [data, selectedOptions]);

  const chartData = useMemo(() => {
    return tableData
      .map((item, index) => ({
        name: item.symbol,
        value: item.value,
        color: colorPicker(index)
      }))
      .filter((el) => el.value > 0);
  }, [tableData]);

  const onSelectChain = useCallback((selectedOptions: Option[]) => {
    setSelectedOptions({
      chain: selectedOptions
    });
  }, []);

  const onSelectAssetType = useCallback((selectedOptions: Option[]) => {
    setSelectedOptions({
      assetType: selectedOptions
    });
  }, []);

  const onSelectMarket = useCallback((selectedOptions: Option[]) => {
    setSelectedOptions({
      deployment: selectedOptions
    });
  }, []);

  const onClearSelectedOptions = useCallback(() => {
    setSelectedOptions({
      chain: [],
      assetType: [],
      deployment: []
    });
  }, []);

  const onClearAll = useCallback(() => {
    onClearSelectedOptions();
  }, [onClearSelectedOptions]);

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
        <MultiSelect
          options={chainOptions || []}
          value={selectedOptions.chain}
          onChange={onSelectChain}
          placeholder='Chain'
          disabled={isLoading}
        />
        <MultiSelect
          options={assetTypeOptions || []}
          value={selectedOptions.assetType}
          onChange={onSelectAssetType}
          placeholder='Asset Type'
          disabled={isLoading}
        />
        <MultiSelect
          options={deploymentOptionsFilter}
          value={selectedOptions.deployment}
          onChange={onSelectMarket}
          placeholder='Market'
          disabled={isLoading}
        />
      </div>
      <View.Condition if={Boolean(!isLoading && !isError && tableData.length)}>
        <div className='flex justify-between gap-10'>
          <CryptoChart data={chartData} />
          <TreasuryBalanceByNetwork tableData={tableData} />
        </div>
      </View.Condition>
      <View.Condition if={Boolean(!isLoading && !isError && !tableData.length)}>
        <NoDataPlaceholder onButtonClick={onClearAll} />
      </View.Condition>
    </Card>
  );
};

export default TreasuryBalanceByNetworkBlock;
