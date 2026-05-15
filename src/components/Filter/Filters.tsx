import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { noop } from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

export interface FiltersProps {
  isShowClear: boolean;
  children: React.ReactNode;
  onClearAll?: () => void;
}

export interface FilterContextValue {
  expandedFilter: string | null;
  setExpandedFilter: Dispatch<SetStateAction<string | null>>;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export const useFilterContext = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useExpandedFilter must be used within Filters');
  return ctx;
};

export const Filters = (props: FiltersProps) => {
  const { children, onClearAll = noop, isShowClear } = props;
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const [isDrawer, setIsDrawer] = useState(false);

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  if (isMobile) {
    return (
      <FilterContext.Provider value={{ expandedFilter, setExpandedFilter }}>
        <Button
          className='bg-secondary-27 text-gray-11 shadow-13 grow sm:max-w-[130px] flex h-9 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold md:h-8 lg:hidden'
          onClick={() => setIsDrawer(true)}
        >
          <Icon
            name='filters'
            className='h-[14px] w-[14px] fill-none'
          />
          Filters
        </Button>
        <Drawer
          onClose={() => {
            setIsDrawer(false);
            setExpandedFilter(null);
          }}
          isOpen={isDrawer}
        >
          {!expandedFilter && (
            <Text
              size='17'
              weight='700'
              lineHeight='140'
              align='center'
              className='mb-8 w-full'
            >
              Filters
            </Text>
          )}
          {children}
          {(isShowClear && expandedFilter === null) && (
            <Button
              className={'cursor-pointer transition text-primary-14 mt-8 flex w-full items-center justify-center rounded-lg px-3 py-4 text-[11px] font-medium'}
              onClick={onClearAll}
            >
              Clear Filters
            </Button>
          )}
        </Drawer>
      </FilterContext.Provider>
    );
  }

  return (
    <FilterContext.Provider value={{ expandedFilter, setExpandedFilter }}>
      {children}
    </FilterContext.Provider>
  );
};