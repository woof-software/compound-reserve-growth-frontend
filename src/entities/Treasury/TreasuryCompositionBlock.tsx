import React, { memo, useCallback, useMemo, useReducer, useState } from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import GroupDrawer from '@/components/GroupDrawer/GroupDrawer';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import SortDrawer from '@/components/SortDrawer/SortDrawer';
import TreasuryComposition from '@/components/TreasuryPageTable/TreasuryComposition';
import { useModal } from '@/shared/hooks/useModal';
import {
  capitalizeFirstLetter,
  formatPrice,
  groupByKey,
  groupOptionsDto
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import Icon from '@/shared/ui/Icon/Icon';
import Switch from '@/shared/ui/Switch/Switch';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

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
        name: capitalizeFirstLetter(key) || 'Unclassified',
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
      const symbol = value[0]?.source.asset.symbol || key;

      return {
        id: index + 1,
        icon: key.replace(/ /g, '-').toLowerCase(),
        name: capitalizeFirstLetter(key) || 'Unclassified',
        balance,
        symbol: symbol
      };
    })
    .sort((a, b) => b.balance - a.balance);
};

export const treasuryCompositionColumns = [
  {
    accessorKey: 'name',
    header: 'Asset'
  },
  {
    accessorKey: 'balance',
    header: 'Total Balance USD'
  }
];

const TreasuryCompositionBlock = memo(
  ({ isLoading, data }: TreasuryCompositionBlockProps) => {
    const {
      isOpen: isOpenSingle,
      selectedValue: selectedSingle,
      close: closeSingle,
      open: openSingle,
      select: selectSingle
    } = useDropdown('single');

    const [includeComp, setIncludeComp] = useState<boolean>(true);

    const [sortType, setSortType] = useReducer(
      (prev, next) => ({
        ...prev,
        ...next
      }),
      { key: '', type: 'asc' }
    );

    const {
      isOpen: isSortOpen,
      onOpenModal: onSortOpen,
      onCloseModal: onSortClose
    } = useModal();

    const {
      isOpen: isGroupOpen,
      onOpenModal: onGroupOpen,
      onCloseModal: onGroupClose
    } = useModal();

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

    const selectedGroup = selectedSingle?.[0] || 'Asset Type';

    const chartData = useMemo(() => {
      if (selectedGroup === 'Chain') {
        const chains = groupByKey(uniqData, (item) => item.source.network);
        return mapChartData(chains, uniqData);
      }

      if (selectedGroup === 'Market') {
        const markets = groupByKey(
          uniqData,
          (item) => item.source.market || 'no market'
        );
        return mapChartData(markets, uniqData);
      }

      return mapChartData(uniqDataByCategory, uniqData);
    }, [selectedGroup, uniqData, uniqDataByCategory]);

    const tableData = useMemo<TreasuryCompositionType[]>(() => {
      if (selectedGroup === 'Chain') {
        const chains = groupByKey(uniqData, (item) => item.source.network);
        return Object.entries(chains)
          .map(([key, value], index) => {
            const balance = value.reduce((acc, item) => acc + item.value, 0);

            let iconName = capitalizeFirstLetter(key);
            if (key.toLowerCase() === 'mainnet') {
              iconName = 'Ethereum';
            }

            return {
              id: index + 1,
              icon: iconName,
              name: capitalizeFirstLetter(key) || 'Unclassified',
              balance
            };
          })
          .sort((a, b) => b.balance - a.balance);
      }

      if (selectedGroup === 'Market') {
        const markets = groupByKey(
          uniqData,
          (item) => item.source.market || 'no market'
        );
        return mapTableData(markets);
      }

      return mapTableData(uniqDataByCategory);
    }, [selectedGroup, uniqData, uniqDataByCategory]);

    const totalBalance = useMemo(
      () => tableData.reduce((acc, item) => acc + item.balance, 0),
      [tableData]
    );

    const hasData = useMemo(() => {
      return tableData.length > 0 && chartData.length > 0;
    }, [tableData, chartData]);

    const onSortKeySelect = useCallback((value: string) => {
      setSortType({
        key: value
      });
    }, []);

    const onSortTypeSelect = useCallback((value: string) => {
      setSortType({
        type: value
      });
    }, []);

    const onClearAll = () => {
      selectSingle('Asset Type');

      setIncludeComp(true);
    };

    return (
      <Card
        isLoading={isLoading}
        id={'treasury-composition'}
        title='Treasury Composition'
        className={{
          loading: 'min-h-[inherit]',
          container: 'min-h-[520px] rounded-lg',
          content: 'flex flex-col gap-3 px-0 py-0 md:px-5 md:pb-5 lg:pb-10'
        }}
      >
        <div className='flex flex-col-reverse items-center justify-end gap-2 px-5 py-3 sm:flex-row md:px-0 md:py-3'>
          <div className='flex w-full justify-end sm:w-auto'>
            <Switch
              label='Include COMP Holdings'
              positionLabel='left'
              checked={includeComp}
              onCheckedChange={setIncludeComp}
              classNameTitle='!text-[12px]'
            />
          </div>
          <div className='flex w-full items-center gap-2 sm:w-auto'>
            <Button
              onClick={onGroupOpen}
              className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-1/2 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8 lg:hidden'
            >
              <Icon
                name='group-grid'
                className='h-[14px] w-[14px] fill-none'
              />
              Group
            </Button>
            <div className='hidden items-center gap-1 lg:flex'>
              <Text
                tag='span'
                size='11'
                weight='600'
                lineHeight='16'
                className='text-primary-14'
              >
                Group by
              </Text>
              <SingleDropdown
                options={options}
                isOpen={isOpenSingle}
                selectedValue={selectedGroup}
                onOpen={openSingle}
                onClose={closeSingle}
                onSelect={selectSingle}
                triggerContentClassName='p-[5px]'
              />
            </div>
            <Button
              onClick={onSortOpen}
              className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-1/2 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:hidden md:h-8'
            >
              <Icon
                name='sort-icon'
                className='h-[14px] w-[14px]'
              />
              Sort
            </Button>
          </div>
        </div>
        <div className='flex flex-col justify-between gap-8 md:flex-row'>
          <View.Condition if={!hasData}>
            <NoDataPlaceholder onButtonClick={onClearAll} />
          </View.Condition>
          <View.Condition if={hasData}>
            <PieChart
              className='max-w-full md:max-w-1/2 lg:max-w-[336.5px]'
              data={chartData}
            />
            <TreasuryComposition
              sortType={sortType}
              tableData={tableData}
              totalBalance={totalBalance}
              activeFilter={selectedGroup as 'Chain' | 'Asset Type' | 'Market'}
            />
          </View.Condition>
        </div>
        <SortDrawer
          isOpen={isSortOpen}
          sortType={sortType}
          columns={treasuryCompositionColumns}
          onClose={onSortClose}
          onKeySelect={onSortKeySelect}
          onTypeSelect={onSortTypeSelect}
        />
        <GroupDrawer
          isOpen={isGroupOpen}
          selectedOption={selectedGroup}
          options={groupOptionsDto(options)}
          onClose={onGroupClose}
          onSelect={selectSingle}
        />
      </Card>
    );
  }
);

export default TreasuryCompositionBlock;
