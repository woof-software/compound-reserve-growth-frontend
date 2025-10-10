import { CSVLink } from 'react-csv';

import Filter from '@/components/Filter/Filter';
import { useModal } from '@/shared/hooks/useModal';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import { OptionType } from '@/shared/types/types';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import Switch from '@/shared/ui/Switch/Switch';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

export type FilterOptions = {
  id: string;
  placeholder: string;
  total: number;
  selectedOptions: OptionType[];
  options: OptionType[];
  disableSelectAll?: boolean;
  onChange?: (selectedOptions: OptionType[]) => void;
};

interface FeesGeneratedIncentivesMobileFiltersProps {
  barSize: 'D' | 'W' | 'M';
  onBarSizeChange: (value: 'D' | 'W' | 'M') => void;
  filterOptions: () => FilterOptions[];
  onClearAll: () => void;
  csvData: Record<string, string | number>[];
  isRevenueOnly: boolean;
  setIsRevenueOnly: (b: boolean) => void;
}

export const FeesGeneratedIncentivesMobileFilters = (
  props: FeesGeneratedIncentivesMobileFiltersProps
) => {
  const {
    barSize,
    onBarSizeChange,
    filterOptions,
    onClearAll,
    csvData,
    isRevenueOnly,
    setIsRevenueOnly
  } = props;

  const { isOpen, onOpenModal, onCloseModal } = useModal();

  const {
    isOpen: isMoreOpen,
    onOpenModal: onMoreOpen,
    onCloseModal: onMoreClose
  } = useModal();

  return (
    <div className='block lg:hidden'>
      <div className='flex flex-col justify-end gap-2 px-5 py-3 sm:flex-row md:px-0'>
        <div className='flex flex-row justify-end gap-2'>
          <TabsGroup
            className={{
              container: 'w-full sm:w-auto',
              list: 'w-full sm:w-auto'
            }}
            tabs={['D', 'W', 'M']}
            value={barSize}
            onTabChange={onBarSizeChange}
          />
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
        </div>
        <div className='flex flex-row items-center justify-end gap-2'>
          <div className='flex w-full flex-row-reverse items-center gap-2 sm:w-auto sm:flex-row'>
            <Button
              onClick={onOpenModal}
              className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-full min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:hidden sm:w-auto md:h-8'
            >
              <Icon
                name='filters'
                className='h-[14px] w-[14px] fill-none'
              />
              Filters
            </Button>
            <Switch
              label='Revenue Only'
              positionLabel='left'
              checked={isRevenueOnly}
              onCheckedChange={setIsRevenueOnly}
              className={{ title: '!text-[11px]' }}
            />
          </div>
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
      <Filter
        isOpen={isOpen}
        filterOptions={filterOptions()}
        onClose={onCloseModal}
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
              filename={getCsvFileName('fees_generated_vs_incentives')}
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
