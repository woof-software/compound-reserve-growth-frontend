import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

export interface GroupFilterContextValue {
  expandedFilter: string | null;
  setExpandedFilter: (v: string | null) => void;
}

export interface GroupFiltersProps {
  children?: ReactNode;
}

const GroupFilterContext = createContext<GroupFilterContextValue | null>(null);

export const useGroupFilterContext = () => useContext(GroupFilterContext);

export const GroupFilters = (props: GroupFiltersProps) => {
  const { children } = props;

  const isMobile = useMediaQuery('(max-width: 63.938rem)');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const contextValue = useMemo(
    () => ({ expandedFilter, setExpandedFilter }),
    [expandedFilter]
  );

  const onClose = () => {
    setIsDrawerOpen(false);
    setExpandedFilter(null);
  };

  if (isMobile) {
    return (
      <GroupFilterContext.Provider value={contextValue}>
        <Button
          className='bg-secondary-27 text-gray-11 shadow-13 grow sm:max-w-32.5 flex h-9 min-w-32.5 gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold md:h-8 lg:hidden'
          onClick={() => setIsDrawerOpen(true)}
        >
          <Icon name='group-grid' className='h-3.5 w-3.5 fill-none' />
          Group
        </Button>
        <Drawer onClose={onClose} isOpen={isDrawerOpen}>
          {!expandedFilter && (
            <Text size='17' weight='700' lineHeight='140' align='center' className='mb-8 w-full'>
              Group
            </Text>
          )}
          <div className='flex gap-2 flex-col'>
            {children}
          </div>
        </Drawer>
      </GroupFilterContext.Provider>
    );
  }

  return (
    <GroupFilterContext.Provider value={contextValue}>
      {children}
    </GroupFilterContext.Provider>
  );
};