import { parseAsBoolean, useQueryState } from 'nuqs';
import { GroupFilter } from '@/components/Filter/GroupFilter';
import { memo, useMemo } from 'react';
import PieChart from "@/components/Charts/Pie/Pie";
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import TreasuryComposition from '@/components/TreasuryPageTable/TreasuryComposition';
import { NOT_MARKET } from '@/shared/consts/consts';
import { useModal } from '@/shared/hooks/useModal';
import {
  SortAccessor,
  SortAdapter,
  useSorting
} from '@/shared/hooks/useSorting';
import { Format } from '@/shared/lib/utils/format';
import {
  capitalizeFirstLetter,
  groupByKey,
  removeDuplicates
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Icon from '@/shared/ui/Icon/Icon';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';
import Switch from '@/shared/ui/Switch/Switch';

export interface TreasuryCompositionType {
  id: number;
  icon: string;
  name: string;
  balance: number;
}

export type CompositionData = {
  uniqData: TokenData[];
  uniqDataByCategory: Record<string, TokenData[]>;
};

export interface TreasuryCompositionBlockProps {
  isLoading?: boolean;
  data: CompositionData;
}

const groupByOptions = [
  {label: 'Asset Type', value: 'assetType'},
  {label: 'Chain', value: 'chain'},
  {label: 'Market', value: 'deployment'}
];

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
    const [selectedGroupKey, setSelectedGroupKey] = useQueryState('tc-group', { defaultValue: 'assetType' });

    const selectedGroupOption = useMemo(() => {
      const selectedElement = groupByOptions.find(({value}) => value === selectedGroupKey);

      if (!selectedElement) throw new Error('Selected group option not found');

      return selectedElement;
    }, [groupByOptions, selectedGroupKey]);

    const [includeComp, setIncludeComp] = useQueryState('tc-includeComp',  parseAsBoolean.withDefault(true));

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
      if (selectedGroupOption.value === 'chain') {
        const chains = groupByKey(uniqData, (item) => item.source.network);
        return mapChartData(chains, uniqData);
      }

      if (selectedGroupOption.value === 'deployment') {
        const markets = groupByKey(
          uniqData,
          (item) => item.source.market || NOT_MARKET
        );
        return mapChartData(markets, uniqData);
      }

      return mapChartData(uniqDataByCategory, uniqData);
    }, [selectedGroupOption, uniqData, uniqDataByCategory]);

    const tableData = useMemo<TreasuryCompositionType[]>(() => {
      if (selectedGroupOption.value === 'chain') {
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

      if (selectedGroupOption.value === 'deployment') {
        const markets = groupByKey(
          uniqData,
          (item) => item.source.market || NOT_MARKET
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
    }, [selectedGroupOption, uniqData, uniqDataByCategory]);

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
            header: selectedGroupOption.value !== 'assetType' ? selectedGroupOption.value : 'Asset'
          },
          {
            accessorKey: 'balance',
            header: 'Total Balance USD'
          }
        ],
        [selectedGroupOption]
      );

    const onClearAll = () => {
      setSelectedGroupKey('assetType');
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
            <GroupFilter
              options={groupByOptions}
              getKey={(v) => v.value}
              getLabel={(v) => v.label}
              value={selectedGroupOption}
              setValue={({value}) => setSelectedGroupKey(value)}
            />
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
          {hasData ? (
            <>
              <PieChart
                className="max-w-full md:max-w-1/2 lg:max-w-[450px]"
                data={chartData}
              />
              <TreasuryComposition
                sortType={sortType}
                tableData={tableData}
                totalBalance={totalBalance}
                activeFilter={selectedGroupOption.label as 'Chain' | 'Asset Type' | 'Market'}
              />
            </>
          ) : (
            <NoDataPlaceholder onButtonClick={onClearAll} />
          )}
        </div>
        <SortDrawer
          isOpen={isSortOpen}
          sortType={sortType}
          columns={treasuryCompositionColumns}
          onClose={onSortClose}
          onKeySelect={onKeySelect}
          onTypeSelect={onTypeSelect}
        />
      </Card>
    );
  }
);

export default TreasuryCompositionBlock;
