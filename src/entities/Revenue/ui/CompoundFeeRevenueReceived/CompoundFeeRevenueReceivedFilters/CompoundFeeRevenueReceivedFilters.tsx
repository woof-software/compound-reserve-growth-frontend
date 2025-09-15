import React, { memo, useMemo } from 'react';
import { CSVLink } from 'react-csv';

import { CompoundFeeRevenueReceivedFiltersProps } from '@/entities/Revenue';
import { groupByOptionsWithNone } from '@/shared/consts';
import { useModal } from '@/shared/hooks';
import { groupOptionsDto } from '@/shared/lib/utils';
import { Button, Icon, Text, View } from '@/shared/ui/atoms';
import { ChartIconToggle, Drawer, TabsGroup } from '@/shared/ui/molecules';
import {
  CSVDownloadButton,
  Filter,
  GroupDrawer,
  MultiSelect,
  SingleDropdown
} from '@/shared/ui/organisms';

const CompoundFeeRevenueReceivedFilters = memo(
  ({
    barSize,
    openSingle,
    groupBy,
    csvData,
    csvFilename,
    chainOptions,
    selectedOptions,
    isShowEyeIcon,
    areAllSeriesHidden,
    deploymentOptionsFilter,
    assetTypeOptions,
    symbolOptions,
    isLoading,
    onSelectChain,
    onSelectAssetType,
    onSelectMarket,
    onSelectSymbol,
    onBarSizeChange,
    toggleSingle,
    closeSingle,
    selectSingle,
    onClearAll,
    onSelectAll,
    onDeselectAll
  }: CompoundFeeRevenueReceivedFiltersProps) => {
    const { isOpen, onOpenModal, onCloseModal } = useModal();

    const {
      isOpen: isMoreOpen,
      onOpenModal: onMoreOpen,
      onCloseModal: onMoreClose
    } = useModal();

    const {
      isOpen: isGroupOpen,
      onOpenModal: onGroupOpen,
      onCloseModal: onGroupClose
    } = useModal();

    const filterOptions = useMemo(() => {
      const chainFilterOptions = {
        id: 'chain',
        placeholder: 'Chain',
        total: selectedOptions.chain.length,
        selectedOptions: selectedOptions.chain,
        options: chainOptions || [],
        onChange: onSelectChain
      };

      const marketFilterOptions = {
        id: 'market',
        placeholder: 'Market',
        total: selectedOptions.market.length,
        selectedOptions: selectedOptions.market,
        options: deploymentOptionsFilter || [],
        onChange: onSelectMarket
      };

      const assetTypeFilterOptions = {
        id: 'assetType',
        placeholder: 'Asset Type',
        total: selectedOptions.assetType.length,
        selectedOptions: selectedOptions.assetType,
        options:
          assetTypeOptions?.sort((a, b) => a.label.localeCompare(b.label)) ||
          [],
        onChange: onSelectAssetType
      };

      const symbolFilterOptions = {
        id: 'reserveSymbol',
        placeholder: 'Reserve Symbols',
        total: selectedOptions.symbol.length,
        selectedOptions: selectedOptions.symbol,
        options:
          symbolOptions?.sort((a, b) => a.label.localeCompare(b.label)) || [],
        onChange: onSelectSymbol
      };

      return [
        chainFilterOptions,
        marketFilterOptions,
        assetTypeFilterOptions,
        symbolFilterOptions
      ];
    }, [
      assetTypeOptions,
      chainOptions,
      deploymentOptionsFilter,
      onSelectAssetType,
      onSelectChain,
      onSelectMarket,
      selectedOptions
    ]);

    const onEyeClick = () => {
      if (areAllSeriesHidden) {
        onSelectAll();
      } else {
        onDeselectAll();
      }

      onMoreClose();
    };

    return (
      <>
        <div className='hidden lg:block'>
          <div className='flex items-center justify-end gap-2 px-0 py-3'>
            <TabsGroup
              tabs={['D', 'W', 'M']}
              value={barSize}
              onTabChange={onBarSizeChange}
              disabled={isLoading}
            />
            <MultiSelect
              options={chainOptions || []}
              value={selectedOptions.chain}
              onChange={onSelectChain}
              placeholder='Chain'
              disabled={isLoading}
            />
            <MultiSelect
              options={deploymentOptionsFilter}
              value={selectedOptions.market}
              onChange={onSelectMarket}
              placeholder='Market'
              disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
            />
            <MultiSelect
              options={
                assetTypeOptions?.sort((a, b) =>
                  a.label.localeCompare(b.label)
                ) || []
              }
              value={selectedOptions.assetType}
              onChange={onSelectAssetType}
              placeholder='Asset Type'
              disabled={isLoading}
            />
            <MultiSelect
              options={
                symbolOptions?.sort((a, b) => a.label.localeCompare(b.label)) ||
                []
              }
              value={selectedOptions.symbol}
              onChange={onSelectSymbol}
              placeholder='Reserve Symbols'
              disabled={isLoading}
            />
            <div className='flex items-center gap-1'>
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
                options={groupByOptionsWithNone}
                isOpen={openSingle}
                selectedValue={groupBy}
                onOpen={toggleSingle}
                onClose={closeSingle}
                onSelect={selectSingle}
                disabled={isLoading}
                triggerContentClassName='p-[5px]'
              />
            </div>
            <CSVDownloadButton
              data={csvData}
              filename={csvFilename}
            />
          </div>
        </div>
        <div className='block lg:hidden'>
          <div className='flex flex-col justify-end gap-2 px-5 py-3 md:px-0'>
            <div className='flex flex-col items-center justify-end gap-2 sm:flex-row'>
              <div className='flex w-full flex-row items-center gap-2 sm:w-auto'>
                <TabsGroup
                  className={{
                    container: 'hidden w-1/2 sm:block sm:w-auto',
                    list: 'w-full sm:w-auto'
                  }}
                  tabs={['D', 'W', 'M']}
                  value={barSize}
                  onTabChange={onBarSizeChange}
                  disabled={isLoading}
                />
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
                <Button
                  onClick={onOpenModal}
                  className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-1/2 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:hidden sm:w-auto md:h-8'
                >
                  <Icon
                    name='filters'
                    className='h-[14px] w-[14px] fill-none'
                  />
                  Filters
                </Button>
              </div>
              <div className='flex w-full flex-row items-center gap-2 sm:w-auto'>
                <Button
                  onClick={onOpenModal}
                  className='bg-secondary-27 text-gray-11 shadow-13 hidden h-9 w-full min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:flex sm:w-auto md:h-8'
                >
                  <Icon
                    name='filters'
                    className='h-[14px] w-[14px] fill-none'
                  />
                  Filters
                </Button>
                <TabsGroup
                  className={{
                    container: 'block w-full sm:hidden sm:w-auto',
                    list: 'w-full sm:w-auto'
                  }}
                  tabs={['D', 'W', 'M']}
                  value={barSize}
                  onTabChange={onBarSizeChange}
                  disabled={isLoading}
                />
                <Button
                  onClick={onMoreOpen}
                  className='bg-secondary-27 shadow-13 md:miw-w-8 flex h-9 min-w-9 rounded-lg sm:w-auto md:h-8 lg:hidden'
                >
                  <Icon
                    name='3-dots'
                    className='h-6 w-6 fill-none'
                  />
                </Button>
              </div>
            </div>
          </div>
          <Filter
            isOpen={isOpen}
            filterOptions={filterOptions}
            onClose={onCloseModal}
            onClearAll={onClearAll}
          />
          <GroupDrawer
            isOpen={isGroupOpen}
            selectedOption={groupBy}
            options={groupOptionsDto(groupByOptionsWithNone)}
            onClose={onGroupClose}
            onSelect={selectSingle}
          />
          <Drawer
            isOpen={isMoreOpen}
            onClose={onMoreClose}
          >
            <Text
              size='17'
              weight='700'
              align='center'
              className='mb-5'
            >
              Actions
            </Text>
            <div className='flex flex-col gap-1.5'>
              <div className='px-3 py-2'>
                <CSVLink
                  data={csvData}
                  filename={csvFilename}
                  onClick={onMoreClose}
                >
                  <div className='flex items-center gap-1.5'>
                    <Icon
                      name='download'
                      className='h-[26px] w-[26px]'
                    />
                    <Text
                      size='14'
                      weight='500'
                    >
                      CSV with the entire historical data
                    </Text>
                  </div>
                </CSVLink>
              </div>
              <View.Condition if={isShowEyeIcon}>
                <div className='px-3 py-2'>
                  <ChartIconToggle
                    active={areAllSeriesHidden}
                    onIcon='eye'
                    offIcon='eye-closed'
                    ariaLabel='Toggle all series visibility'
                    className={{
                      container:
                        'flex items-center gap-1.5 bg-transparent p-0 !shadow-none',
                      icon: 'h-[26px] w-[26px]',
                      iconContainer: 'h-[26px] w-[26px]'
                    }}
                    onClick={onEyeClick}
                  >
                    <Text
                      size='14'
                      weight='500'
                    >
                      Unselect All
                    </Text>
                  </ChartIconToggle>
                </div>
              </View.Condition>
            </div>
          </Drawer>
        </div>
      </>
    );
  }
);

export { CompoundFeeRevenueReceivedFilters };
