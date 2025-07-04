import React, { memo, useMemo } from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import { TreasuryCompositionType } from '@/components/TreasuryPageTable/MOCK_DATA';
import TreasuryComposition from '@/components/TreasuryPageTable/TreasuryComposition';
import {
  capitalizeFirstLetter,
  formatPrice,
  groupByKey
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import Card from '@/shared/ui/Card/Card';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';

const options = ['Asset Type', 'Chain', 'Market'];

type CompositionData = {
  uniqData: TokenData[];

  uniqDataByCategory: Record<string, TokenData[]>;
};

interface TreasuryCompositionBlockProps {
  isLoading?: boolean;

  data: CompositionData;
}

const mapChartData = (
  data: Record<string, TokenData[]>,
  uniqData: TokenData[]
) => {
  return Object.entries(data).map(([key, value]) => {
    const totalValue = value.reduce((acc, item) => acc + item.value, 0);

    const percent = (
      (totalValue / uniqData.reduce((acc, item) => acc + item.value, 0)) *
      100
    ).toFixed(2);

    return {
      name: key,
      percent: parseFloat(percent),
      value: formatPrice(totalValue, 1)
    };
  });
};

const mapTableData = (data: Record<string, TokenData[]>) => {
  return Object.entries(data).map(([key, value], index) => {
    const balance = value.reduce((acc, item) => acc + item.value, 0);

    return {
      id: index + 1,
      icon: key.replace(/ /g, '-').toLowerCase(),
      name: capitalizeFirstLetter(key) || 'Unclassified',
      balance
    };
  });
};

const TreasuryCompositionBlock = memo(
  ({ isLoading, data }: TreasuryCompositionBlockProps) => {
    const {
      open: openSingle,
      selectedValue: selectedSingle,
      toggle: toggleSingle,
      close: closeSingle,
      select: selectSingle
    } = useDropdown('single');

    const { uniqData, uniqDataByCategory } = data;

    const chartData = useMemo(() => {
      if (selectedSingle?.[0] === 'Chain') {
        const chains = groupByKey(uniqData, (item) => item.source.network);

        return mapChartData(chains, uniqData);
      }

      if (selectedSingle?.[0] === 'Market') {
        const markets = groupByKey(uniqData, (item) => item.source.market);

        return mapChartData(markets, uniqData);
      }

      return mapChartData(uniqDataByCategory, uniqData);
    }, [selectedSingle, uniqData, uniqDataByCategory]);

    const tableData = useMemo<TreasuryCompositionType[]>(() => {
      if (selectedSingle?.[0] === 'Chain') {
        const chains = groupByKey(uniqData, (item) => item.source.network);

        return mapTableData(chains);
      }

      if (selectedSingle?.[0] === 'Market') {
        const markets = groupByKey(uniqData, (item) => item.source.market);

        return mapTableData(markets);
      }

      return mapTableData(uniqDataByCategory);
    }, [selectedSingle, uniqData, uniqDataByCategory]);

    const totalBalance = useMemo(() => {
      if (selectedSingle?.[0] === 'Chain') {
        const chains = groupByKey(uniqData, (item) => item.source.network);

        return mapTableData(chains).reduce(
          (acc, item) => acc + item.balance,
          0
        );
      }

      if (selectedSingle?.[0] === 'Market') {
        const markets = groupByKey(uniqData, (item) => item.source.market);

        return mapTableData(markets).reduce(
          (acc, item) => acc + item.balance,
          0
        );
      }

      return mapTableData(uniqDataByCategory).reduce(
        (acc, item) => acc + item.balance,
        0
      );
    }, [selectedSingle, uniqData, uniqDataByCategory]);

    return (
      <Card
        isLoading={isLoading}
        title='Treasury Composition'
        className={{
          loading: 'min-h-[inherit]',
          container: 'min-h-[571px]',
          content: 'flex flex-col gap-3 px-10 pt-0 pb-10'
        }}
      >
        <div className='flex justify-end py-3'>
          <SingleDropdown
            options={options}
            isOpen={openSingle}
            selectedValue={selectedSingle?.[0] || ''}
            onToggle={toggleSingle}
            onClose={closeSingle}
            onSelect={selectSingle}
          />
        </div>
        <div className='flex justify-between'>
          <PieChart
            className='max-h-[400px] max-w-[336.5px]'
            data={chartData}
          />
          <TreasuryComposition
            tableData={tableData}
            totalBalance={totalBalance}
          />
        </div>
      </Card>
    );
  }
);

export default TreasuryCompositionBlock;
