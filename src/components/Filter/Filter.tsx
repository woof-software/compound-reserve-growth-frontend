import { FC, memo, RefObject, useRef } from 'react';

import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { useModal } from '@/shared/hooks/useModal';
import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Each from '@/shared/ui/Each/Each';
import { Select } from '@/shared/ui/Select/Select';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

import FilterIcon from '@/assets/svg/filter-icon.svg';

export type SelectedFiltersType = {
  id: string;

  selectedItems: string[];
};

type FilterListItem = {
  id: string;

  title: string;

  placeholder: string;

  options: string[];
};

interface FilterProps {
  activeFilters: number;

  filtersList: FilterListItem[];

  selectedItems: SelectedFiltersType[];

  onFilterItemSelect: (filterId: string, item: string) => void;

  onClear: () => void;

  onApply: () => void;

  onOutsideClick: () => void;
}

const Filter: FC<FilterProps> = memo(
  ({
    activeFilters,
    filtersList,
    selectedItems,
    onFilterItemSelect,
    onApply,
    onClear,
    onOutsideClick: onOutside
  }) => {
    const { isOpen, onCloseModal, onToggleModal } = useModal();

    const containerRef = useRef<HTMLDivElement>(null);

    const onClearClick = () => {
      onClear();

      onCloseModal();
    };

    const onApplyClick = () => {
      onApply();

      onCloseModal();
    };

    const onOutsideClick = () => {
      if (isOpen) {
        onOutside();

        onCloseModal();
      }
    };

    useClickOutside(containerRef as RefObject<HTMLDivElement>, onOutsideClick);

    return (
      <div
        ref={containerRef}
        className='relative z-10'
      >
        <div
          className={cn(
            'flex max-w-[90px] cursor-pointer items-center gap-1.5 rounded-sm px-2 py-1.5',
            {
              'bg-secondary-11': isOpen
            }
          )}
          onClick={onToggleModal}
        >
          <FilterIcon />

          <Text
            className='text-primary-14'
            size='11'
            weight='500'
            lineHeight='16'
          >
            Filter
          </Text>

          <View.Condition if={Boolean(activeFilters)}>
            <Text
              tag='span'
              className='bg-secondary-17 text-primary-14 h-5 min-h-5 w-5 min-w-5 rounded-full p-0.5'
              size='11'
              weight='500'
              lineHeight='16'
              align='center'
            >
              {activeFilters}
            </Text>
          </View.Condition>
        </div>

        <View.Condition if={isOpen}>
          <div className='bg-primary-15 shadow-12 border-secondary-18 absolute top-9 right-0 grid min-w-[600px] gap-5 rounded-lg border border-solid px-8 py-10'>
            <Text
              className='text-secondary-10'
              size='17'
              weight='600'
              lineHeight='20'
            >
              Filter
            </Text>

            <div className='grid gap-5'>
              <Each
                data={filtersList}
                render={(filterItem, index) => {
                  const selectedFilter = selectedItems.find(
                    (el) => el.id === filterItem.id
                  );

                  return (
                    <Select
                      key={index}
                      filterId={filterItem.id}
                      {...filterItem}
                      selectedItems={selectedFilter?.selectedItems || []}
                      onItemSelect={onFilterItemSelect}
                      onItemDelete={onFilterItemSelect}
                    />
                  );
                }}
              />
            </div>

            <div className='flex w-full justify-end'>
              <div className='flex gap-2'>
                <Button
                  className='h-8 w-[100px] cursor-pointer rounded-[100px] p-2 text-[11px] leading-4 font-medium'
                  onClick={onClearClick}
                >
                  Clear All
                </Button>

                <Button
                  className='bg-secondary-16 text-secondary-10 h-8 w-[100px] cursor-pointer rounded-[100px] p-2 text-[11px] leading-4 font-medium'
                  onClick={onApplyClick}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </View.Condition>
      </div>
    );
  }
);

export default Filter;
