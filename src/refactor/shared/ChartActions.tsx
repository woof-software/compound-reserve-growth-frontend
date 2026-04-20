import React, { Dispatch, ReactNode, SetStateAction, useState } from 'react';

import ChartIconToggle from '@/components/ChartIconToggle/ChartIconToggle';
import { useMediaQuery } from '@/refactor/hooks/useMediaQuery';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

interface ChartActionsProps {
  children: ReactNode
  isShowEvents: boolean
  setIsShowEvents: Dispatch<SetStateAction<boolean>>
}

export const ChartActions = (props: ChartActionsProps) => {
  const { children, isShowEvents, setIsShowEvents } = props;

  const [isDrawer, setIsDrawer] = useState(false);

  const isMobile = useMediaQuery('(max-width: 63.938rem)');
  
  if (isMobile) {
    return (
      <>
        <Button
          className='bg-secondary-27 text-gray-11 flex w-full max-w-[44px] gap-1.5 rounded-lg p-2.5 text-[14px] leading-4 font-semibold sm:w-auto h-[44px]'
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
            {children}

            <ChartIconToggle
              active={!isShowEvents}
              onIcon='calendar-check'
              offIcon='calendar-uncheck'
              ariaLabel='Toggle events'
              className={{
                container:
                  'flex items-center gap-1.5 bg-transparent p-0 !shadow-none h-[44px]',
                icon: 'h-[26px] w-[26px]',
                iconContainer: 'h-[26px] w-[26px]'
              }}
              onClick={() => setIsShowEvents(prev => !prev)}
            >
              <Text
                size='14'
                weight='500'
              >
                Hide Events
              </Text>
            </ChartIconToggle>
          </div>
        </Drawer>
      </>
    );
  };
  
  return (
    <div className={'flex items-center'}>
      {children}
    </div>
  );
};