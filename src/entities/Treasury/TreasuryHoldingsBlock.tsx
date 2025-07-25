import React, { useCallback, useMemo, useReducer } from 'react';

import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import TreasuryHoldings, {
  TreasuryBalanceByNetworkType
} from '@/components/TreasuryPageTable/TreasuryHoldings';
import {
  capitalizeFirstLetter,
  extractFilterOptions
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import { OptionType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import View from '@/shared/ui/View/View';

interface TreasuryHoldingsBlockProps {
  isLoading?: boolean;
  isError?: boolean;
  data: TokenData[];
}

const mapTableData = (data: TokenData[]) => {
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

const TreasuryHoldingsBlock = ({
  isLoading,
  isError,
  data
}: TreasuryHoldingsBlockProps) => {
  const [selectedOptions, setSelectedOptions] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    {
      chain: [],
      assetType: [],
      deployment: [],
      symbol: []
    }
  );

  const filterOptionsConfig = useMemo(
    () => ({
      chain: { path: 'source.network' },
      assetType: { path: 'source.asset.type' },
      deployment: { path: 'source.market' },
      symbol: { path: 'source.asset.symbol' }
    }),
    []
  );

  const { chainOptions, assetTypeOptions, deploymentOptions, symbolOptions } =
    useMemo(
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

    // Filter markets based on selected chain
    if (selectedOptions.chain.length) {
      const selectedChain = selectedOptions.chain.map(
        (option: OptionType) => option.id
      );

      if (noMarkets) {
        return [...marketV3, ...marketV2, noMarkets].filter((el) =>
          selectedChain.includes(el?.chain || '')
        );
      }

      return [...marketV3, ...marketV2].filter((el) =>
        selectedChain.includes(el?.chain || '')
      );
    }

    if (noMarkets) {
      return [...marketV3, ...marketV2, noMarkets];
    }

    return [...marketV3, ...marketV2];
  }, [deploymentOptions, selectedOptions]);

  const tableData = useMemo<TreasuryBalanceByNetworkType[]>(() => {
    const filtered = data.filter((item) => {
      if (
        selectedOptions.chain.length > 0 &&
        !selectedOptions.chain.some(
          (o: OptionType) => o.id === item.source.network
        )
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

      if (
        selectedOptions.deployment.length > 0 &&
        !selectedOptions.deployment.some((o: OptionType) => o.id === market)
      ) {
        return false;
      }

      if (
        selectedOptions.symbol.length > 0 &&
        !selectedOptions.symbol.some(
          (o: OptionType) => o.id === item.source.asset.symbol
        )
      ) {
        return false;
      }

      return true;
    });

    return mapTableData(filtered).sort((a, b) => b.value - a.value);
  }, [data, selectedOptions]);

  const onSelectChain = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      chain: selectedOptions
    });

    setSelectedOptions({
      deployment: []
    });
  }, []);

  const onSelectAssetType = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      assetType: selectedOptions
    });
  }, []);

  const onSelectMarket = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      deployment: selectedOptions
    });
  }, []);

  const onSelectSymbol = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      symbol: selectedOptions
    });
  }, []);

  const onClearSelectedOptions = useCallback(() => {
    setSelectedOptions({
      chain: [],
      assetType: [],
      deployment: [],
      symbol: []
    });
  }, []);

  const onClearAll = useCallback(() => {
    onClearSelectedOptions();
  }, [onClearSelectedOptions]);

  return (
    <Card
      isError={isError}
      isLoading={isLoading}
      title='Full Treasury Holdings'
      id='full-treasury-holdings'
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[458.5px] overflow-visible',
        content: 'rounded-b-lg pt-0',
        header: 'rounded-t-lg'
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
          options={deploymentOptionsFilter || []}
          value={selectedOptions.deployment}
          onChange={onSelectMarket}
          placeholder='Market'
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
          options={symbolOptions || []}
          value={selectedOptions.symbol}
          onChange={onSelectSymbol}
          placeholder='Reserve Symbols'
          disabled={isLoading}
        />
        <CSVDownloadButton
          data={tableData}
          filename='Full Treasury Holdings'
        />
      </div>
      <View.Condition if={Boolean(!isLoading && !isError && tableData.length)}>
        <TreasuryHoldings tableData={tableData} />
      </View.Condition>
      <View.Condition if={Boolean(!isLoading && !isError && !tableData.length)}>
        <NoDataPlaceholder onButtonClick={onClearAll} />
      </View.Condition>
    </Card>
  );
};

export default TreasuryHoldingsBlock;
