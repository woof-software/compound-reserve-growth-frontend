import { Dispatch, SetStateAction } from 'react';
import { CSVLink } from 'react-csv';

import Filter from '@/components/Filter/Filter';
import { SpendingByChainTableColumns } from '@/entities/Insentive/CurrentSpendingByChainTable/CurrentSpendingByChainTable';
import { useModal } from '@/shared/hooks/useModal';
import {
  SortAccessor,
  SortAdapter,
  SortDirection
} from '@/shared/hooks/useSorting';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

const sortColumns: SortAccessor<SpendingByChainTableColumns>[] = [
  { accessorKey: 'network', header: 'Network' },
  { accessorKey: 'valueComp', header: 'Value COMP' },
  { accessorKey: 'valueUsd', header: 'Value USD' },
  { accessorKey: 'source', header: 'Market' }
];

interface CurrentSpendingByChainMobileFiltersProps {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  onKeySelect: (key: keyof SpendingByChainTableColumns | null) => void;
  onTypeSelect: (type: SortDirection) => void;
  sortType: SortAdapter<SpendingByChainTableColumns>;
  csvData: {
    network: string;
    valueComp: number;
    valueUsd: number;
    source: string;
  };
  filterOptions: any;
  onClearFilters: any;
}

export const CurrendSpendingByChainMobileFilters = (
  props: CurrentSpendingByChainMobileFiltersProps
) => {
  const {
    activeTab,
    setActiveTab,
    sortType,
    csvData,
    onKeySelect,
    onTypeSelect,
    filterOptions,
    onClearFilters
  } = props;

  const mobileFilterOptions = filterOptions().filter(
    (el: any) => el.id !== 'market'
  );

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
    <div className='block px-5 py-3 lg:hidden'>
      <div className='flex flex-col items-center justify-end gap-2 sm:flex-row'>
        <TabsGroup
          className={{
            container: 'hidden sm:block'
          }}
          tabs={['Lend', 'Borrow', 'Total']}
          value={activeTab}
          onTabChange={setActiveTab}
        />
        <div className='flex w-full items-center gap-2 sm:w-auto'>
          <Button
            onClick={onFilterOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-1/2 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8'
          >
            <Icon
              name={'filters'}
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
        </div>
        <div className='flex w-full items-center gap-2 sm:w-auto'>
          <TabsGroup
            className={{
              container: 'block w-full sm:hidden sm:w-auto',
              list: 'w-full sm:w-auto'
            }}
            tabs={['Lend', 'Borrow', 'Total']}
            value={activeTab}
            onTabChange={setActiveTab}
          />
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
        columns={sortColumns}
        onClose={onSortClose}
        onKeySelect={onKeySelect}
        onTypeSelect={onTypeSelect}
      />
      <Filter
        isOpen={isFilterOpen}
        filterOptions={mobileFilterOptions}
        onClose={onFilterClose}
        onClearAll={onClearFilters}
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
              // @ts-expect-error TODO fix csv data type
              data={csvData}
              filename={'Incentive_Current_Spending_By_Chain'}
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
        </div>
      </Drawer>
    </div>
  );
};
