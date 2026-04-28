import React, { ReactNode, useState } from 'react';

import { useMediaQuery } from '@/refactor/hooks/useMediaQuery';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

interface ChartActionsProps {
  children: ReactNode
  mobileChildren?: ReactNode
}

export const ChartActions = (props: ChartActionsProps) => {
  const { children, mobileChildren } = props;

  const [isDrawer, setIsDrawer] = useState(false);

  const isMobile = useMediaQuery('(max-width: 63.938rem)');
  
  if (isMobile) {
    return (
      <>
        <Button
          className='cursor-pointer items-center justify-center transition bg-secondary-27 shadow-13 flex h-9 min-w-9 rounded-lg sm:w-auto md:h-8 md:min-w-8 lg:hidden'
          onClick={() => setIsDrawer(true)}
        >
          <Icon
            name='3-dots'
            className='h-6 w-6 fill-none'
          />
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
            Actions
          </Text>
          <div className='flex flex-col gap-2.5'>
            {mobileChildren}
          </div>
        </Drawer>
      </>
    );
  }
  
  return (
    <div className={'flex items-center'}>
      {children}
    </div>
  );
};