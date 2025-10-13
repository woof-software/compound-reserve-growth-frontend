import { Format } from '@/shared/lib/utils/numbersFormatter';
import React, { memo, useMemo, useState } from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import GroupDrawer from '@/components/GroupDrawer/GroupDrawer';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import TreasuryComposition from '@/components/TreasuryPageTable/TreasuryComposition';
import { useFilterSyncSingle } from '@/shared/hooks/useFiltersSync';
import { useModal } from '@/shared/hooks/useModal';
import {
  SortAccessor,
  SortAdapter,
  useSorting
} from '@/shared/hooks/useSorting';
import {
  capitalizeFirstLetter,
  groupByKey,
  groupOptionsDto,
  removeDuplicates
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import Icon from '@/shared/ui/Icon/Icon';
import SingleDropdown from '@/shared/ui/SingleDropdown/SingleDropdown';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';
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
        value: Format.price(totalValue, 'compact'),
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
        symbol
      };
    })
    .sort((a, b) => b.balance - a.balance);
};

const TreasuryCompositionBlock = memo(
  ({ isLoading, data }: TreasuryCompositionBlockProps) => {
    const {
      isOpen: isOpenSingle,
      selectedValue: selectedSingle,
      close: closeSingle,
      open: openSingle,
      select: selectSingle,
      setSelectedValue
    } = useDropdown('single');

    const [includeComp, setIncludeComp] = useState<boolean>(true);

    const includeCompURl = !includeComp ? 'false' : undefined;

    useFilterSyncSingle('includeComp', includeCompURl, (v) => {
      setIncludeComp(v === 'true');
    });

    useFilterSyncSingle('treasuryCompGroup', selectedSingle, setSelectedValue);

    const { sortKey, sortDirection, onKeySelect, onTypeSelect } =
      useSorting<TreasuryCompositionType>('asc', null);

    const sortType: SortAdapter<TreasuryCompositionType> = {
      type: sortDirection,
      key: sortKey
    };

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

    const selectedGroup = selectedSingle?.toString() || 'Asset Type';

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

        const marketsDto = mapTableData(markets);

        const result = marketsDto.map((el) => ({
          ...el,
          name: el.name.replace(/\s+/g, '')
        }));

        const filteredResult = removeDuplicates(result, 'name');

        return marketsDto.filter((market) =>
          filteredResult.some((item) => item.id === market.id)
        );
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

    const treasuryCompositionColumns: SortAccessor<TreasuryCompositionType>[] =
      useMemo(
        () => [
          {
            accessorKey: 'name',
            header: selectedGroup !== 'Asset Type' ? selectedGroup : 'Asset'
          },
          {
            accessorKey: 'balance',
            header: 'Total Balance USD'
          }
        ],
        [selectedGroup]
      );

    const onGroupSelect = (value: string) => {
      selectSingle(value);

      closeSingle();
    };

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
              className={{
                title: '!text-[12px]'
              }}
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
                onSelect={onGroupSelect}
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
              className='max-w-full md:max-w-1/2 lg:max-w-[450px]'
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
          onKeySelect={onKeySelect}
          onTypeSelect={onTypeSelect}
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
