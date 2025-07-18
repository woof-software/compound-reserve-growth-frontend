import React, { memo, useMemo, useState } from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import TreasuryComposition from '@/components/TreasuryPageTable/TreasuryComposition';
import {
  capitalizeFirstLetter,
  formatPrice,
  groupByKey
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import Card from '@/shared/ui/Card/Card';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import Switch from '@/shared/ui/Switch/Switch';

const options = ['Asset Type', 'Chain', 'Market'];

export interface TreasuryCompositionType {
  id: number;
  icon: string;
  name: string;
  balance: number;
}

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
  const totalSum = uniqData.reduce((acc, item) => acc + item.value, 0);
  if (totalSum === 0) {
    return [];
  }

  return Object.entries(data)
    .map(([key, value]) => {
      const totalValue = value.reduce((acc, item) => acc + item.value, 0);
      const percent = (totalValue / totalSum) * 100;

      return {
        name: key,
        percent: parseFloat(percent.toFixed(2)),
        value: formatPrice(totalValue, 1),
        rawValue: totalValue
      };
    })
    .sort((a, b) => b.percent - a.percent);
};

const mapTableData = (data: Record<string, TokenData[]>) => {
  return Object.entries(data)
    .map(([key, value], index) => {
      const balance = value.reduce((acc, item) => acc + item.value, 0);

      return {
        id: index + 1,
        icon: key.replace(/ /g, '-').toLowerCase(),
        name: capitalizeFirstLetter(key) || 'Unclassified',
        balance
      };
    })
    .sort((a, b) => b.balance - a.balance);
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

    const [includeComp, setIncludeComp] = useState(true);

    const filteredData = useMemo(() => {
      if (includeComp || !data.uniqDataByCategory.COMP) {
        return data;
      }

      const compTokens = new Set(data.uniqDataByCategory.COMP);

      const filteredUniqData = data.uniqData.filter(
        (token) => !compTokens.has(token)
      );

      const filteredUniqDataByCategory = { ...data.uniqDataByCategory };
      delete filteredUniqDataByCategory.COMP;

      return {
        uniqData: filteredUniqData,
        uniqDataByCategory: filteredUniqDataByCategory
      };
    }, [data, includeComp]);

    const { uniqData, uniqDataByCategory } = filteredData;

    const chartData = useMemo(() => {
      if (selectedSingle?.[0] === 'Chain') {
        const chains = groupByKey(uniqData, (item) => item.source.network);
        return mapChartData(chains, uniqData);
      }

      if (selectedSingle?.[0] === 'Market') {
        const markets = groupByKey(
          uniqData,
          (item) => item.source.market || 'no market'
        );
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
        const markets = groupByKey(
          uniqData,
          (item) => item.source.market || 'no market'
        );
        return mapTableData(markets);
      }

      return mapTableData(uniqDataByCategory);
    }, [selectedSingle, uniqData, uniqDataByCategory]);

    const totalBalance = useMemo(
      () => tableData.reduce((acc, item) => acc + item.balance, 0),
      [tableData]
    );

    return (
      <Card
        isLoading={isLoading}
        id={'treasury-composition'}
        title='Treasury Composition'
        className={{
          loading: 'min-h-[inherit]',
          container: 'min-h-[571px]',
          content: 'flex flex-col gap-3 px-10 pt-0 pb-10'
        }}
      >
        <div className='flex items-center justify-end gap-4 py-3'>
          <Switch
            label='Include COMP Holdings'
            positionLabel='left'
            checked={includeComp}
            onCheckedChange={setIncludeComp}
            classNameTitle='!text-[12px]'
          />
          <SingleDropdown
            options={options}
            isOpen={openSingle}
            selectedValue={selectedSingle?.[0] || 'Asset Type'}
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
