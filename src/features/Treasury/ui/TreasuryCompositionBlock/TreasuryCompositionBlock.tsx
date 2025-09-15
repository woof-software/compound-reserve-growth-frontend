import React, { memo, useCallback, useMemo, useReducer, useState } from 'react';

import {
  mapCompositionBlockChartData,
  mapCompositionBlockTableData,
  TreasuryCompositionBlockProps,
  TreasuryCompositionPieChart,
  TreasuryCompositionTable,
  TreasuryCompositionType
} from '@/entities/Treasury';
import { groupByOptions } from '@/shared/consts';
import { useDropdown, useModal } from '@/shared/hooks';
import {
  capitalizeFirstLetter,
  groupByKey,
  groupOptionsDto,
  removeDuplicates
} from '@/shared/lib/utils';
import { Button, Icon, Text, View } from '@/shared/ui/atoms';
import { Card, NoDataPlaceholder, Switch } from '@/shared/ui/molecules';
import { GroupDrawer, SingleDropdown, SortDrawer } from '@/shared/ui/organisms';

const TreasuryCompositionBlock = memo(
  ({ isLoading, data }: TreasuryCompositionBlockProps) => {
    const [includeComp, setIncludeComp] = useState<boolean>(true);

    const [sortType, setSortType] = useReducer(
      (prev, next) => ({
        ...prev,
        ...next
      }),
      { key: '', type: 'asc' }
    );

    const {
      isOpen: isOpenSingle,
      selectedValue: selectedSingle,
      close: closeSingle,
      open: openSingle,
      select: selectSingle
    } = useDropdown('single');

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

    const { uniqData, uniqDataByCategory } = useMemo(() => {
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

    const selectedGroup = useMemo(
      () => selectedSingle?.[0] || 'Asset Type',
      [selectedSingle]
    );

    const chartData = useMemo(() => {
      if (selectedGroup === 'Chain') {
        const chains = groupByKey(uniqData, (item) => item.source.network);
        return mapCompositionBlockChartData(chains, uniqData);
      }

      if (selectedGroup === 'Market') {
        const markets = groupByKey(
          uniqData,
          (item) => item.source.market || 'no market'
        );
        return mapCompositionBlockChartData(markets, uniqData);
      }

      return mapCompositionBlockChartData(uniqDataByCategory, uniqData);
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

        const marketsDto = mapCompositionBlockTableData(markets);

        const result = marketsDto.map((el) => ({
          ...el,
          name: el.name.replace(/\s+/g, '')
        }));

        const filteredResult = removeDuplicates(result, 'name');

        return marketsDto.filter((market) =>
          filteredResult.some((item) => item.id === market.id)
        );
      }

      return mapCompositionBlockTableData(uniqDataByCategory);
    }, [selectedGroup, uniqData, uniqDataByCategory]);

    const totalBalance = useMemo(
      () => tableData.reduce((acc, item) => acc + item.balance, 0),
      [tableData]
    );

    const hasData = useMemo(() => {
      return tableData.length > 0 && chartData.length > 0;
    }, [tableData, chartData]);

    const treasuryCompositionColumns = useMemo(
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

    const onGroupSelect = useCallback(
      (value: string) => {
        selectSingle(value);

        closeSingle();
      },
      [closeSingle, selectSingle]
    );

    const onClearAll = useCallback(() => {
      selectSingle('Asset Type');

      setIncludeComp(true);
    }, [selectSingle]);

    return (
      <Card
        isLoading={isLoading}
        id='Treasury Composition'
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
                options={groupByOptions}
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
            <TreasuryCompositionPieChart
              className='max-w-full md:max-w-1/2 lg:max-w-[336.5px]'
              data={chartData}
            />
            <TreasuryCompositionTable
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
          options={groupOptionsDto(groupByOptions)}
          onClose={onGroupClose}
          onSelect={selectSingle}
        />
      </Card>
    );
  }
);

export { TreasuryCompositionBlock };
