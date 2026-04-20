import React, { ReactNode, useState } from 'react';

import { useFiltersContext } from '@/refactor/filters/FiltersProvider';
import { useMediaQuery } from '@/refactor/hooks/useMediaQuery';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

interface FiltersProps {
  children: ReactNode;
}

export const Filters = (props: FiltersProps) => {
  const { children } = props;

  const { hasSelectedFilters, clearAll, expandedFilter } = useFiltersContext();
  
  const [isDrawer, setIsDrawer] = useState(false);
  
  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  if (isMobile) {
    return (
      <>
        <Button
          className='bg-secondary-27 text-gray-11 flex w-full sm:max-w-[130px] flex-1 gap-1.5 rounded-lg p-2.5 text-[14px] leading-4 font-semibold sm:w-auto h-[44px]'
          onClick={() => setIsDrawer(true)}
        >
          <Icon
            name='filters'
            className='h-[18px] w-[18px] fill-none'
          />
          Filters
        </Button>
        <Drawer
          onClose={() => setIsDrawer(false)}
          isOpen={isDrawer}
        >
          <Text
            size='17'
            weight='700'
            lineHeight='140'
            align='center'
            className='mb-5 w-full'
          >
            Filters
          </Text>

          {children}

          {(hasSelectedFilters && expandedFilter === null) && (
              <Button
                className={'text-primary-14 w-[100%] hover:bg-secondary-40 h-[44px] lg:h-[30px] rounded-lg text-[11px] font-medium dark:hover:text-white'}
                onClick={clearAll}
              >
                Clear All
              </Button>
            )
          }
        </Drawer>
      </>
    );
  }

  return children;
};