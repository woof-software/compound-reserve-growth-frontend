import React from 'react';
import { CSVLink } from 'react-csv';

import Filter from '@/components/Filter/Filter';
import { useModal } from '@/shared/hooks/useModal';
import {
  SortAccessor,
  SortAdapter,
  SortDirection
} from '@/shared/hooks/useSorting';
import { CapoTableItem } from '@/shared/types/Capo/types';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';
import Text from '@/shared/ui/Text/Text';

export const SORT_COLUMNS: SortAccessor<CapoTableItem>[] = [
  { accessorKey: 'network', header: 'Network' },
  { accessorKey: 'collateral', header: 'Collateral' },
  { accessorKey: 'collateralPrice', header: 'Collateral Price' },
  { accessorKey: 'priceRestriction', header: 'Price Restriction' },
  { accessorKey: 'priceFeed', header: 'Price Feed' }
];

export type MobileFiltersProps = {
  filterOptions: any[];
  sortType: SortAdapter<CapoTableItem>;
  onKeySelect: (key: keyof CapoTableItem | null) => void;
  onTypeSelect: (type: SortDirection) => void;
  onClearAll: () => void;
  csvData: any[];
};

export const MobileFilters = ({
  filterOptions,
  sortType,
  onKeySelect,
  onTypeSelect,
  onClearAll,
  csvData
}: MobileFiltersProps) => {
  const {
    isOpen: isFilterOpen,
    onOpenModal: onFilterOpen,
    onCloseModal: onFilterClose
  } = useModal();

  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

  const {
    isOpen: isMoreOpen,
    onOpenModal: onMoreOpen,
    onCloseModal: onMoreClose
  } = useModal();

  return (
    <div className='block lg:hidden'>
      <div className='flex flex-col items-center justify-end gap-2 px-5 py-3 sm:flex-row'>
        <div className='flex w-full items-center gap-2 sm:w-auto'>
          <Button
            onClick={onFilterOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-1/2 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8'
          >
            <Icon
              name='filters'
              className='h-[14px] w-[14px] fill-none'
            />
            Filters
          </Button>
          <Button
            onClick={onSortOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-1/2 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8'
          >
            <Icon
              name='sort-icon'
              className='h-[14px] w-[14px]'
            />
            Sort
          </Button>
          <Button
            onClick={onMoreOpen}
            className='bg-secondary-27 shadow-13 flex h-9 min-w-9 rounded-lg sm:w-auto md:h-8 md:min-w-8 lg:hidden'
          >
            <Icon
              name='3-dots'
              className='h-6 w-6 fill-none'
            />
          </Button>
        </div>
      </div>
      <SortDrawer
        isOpen={isSortOpen}
        sortType={sortType}
        columns={SORT_COLUMNS}
        onClose={onSortClose}
        onKeySelect={onKeySelect}
        onTypeSelect={onTypeSelect}
      />
      <Filter
        isOpen={isFilterOpen}
        filterOptions={filterOptions}
        onClose={onFilterClose}
        onClearAll={onClearAll}
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
              filename='collaterals_price_against_price_restriction'
              onClick={onMoreClose}
            >
              <div className='flex items-center gap-1.5'>
                <Icon
                  name='download'
                  className='h-6.5 w-6.5'
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
        </div>
      </Drawer>
    </div>
  );
};
