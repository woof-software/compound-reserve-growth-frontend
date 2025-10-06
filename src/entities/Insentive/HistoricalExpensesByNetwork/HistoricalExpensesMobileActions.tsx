import React from 'react';
import { CSVLink } from 'react-csv';

import { getCsvFileName } from '@/entities/Insentive/HistoricalExpensesByNetwork/lib/getCsvFileName';
import { useModal } from '@/shared/hooks/useModal';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

interface HistoricalExpensesMobileActionsProps {
  csvData: Record<string, string | number>[];
  activeViewTab: string;
  activeModeTab: string;
  barSize: string;
}

export const HistoricalExpensesMobileActions = (
  props: HistoricalExpensesMobileActionsProps
) => {
  const { csvData, activeModeTab, activeViewTab, barSize } = props;

  const {
    isOpen: isMoreOpen,
    onCloseModal: onMoreClose,
    onOpenModal: onMoreOpen
  } = useModal();

  return (
    <>
      <Button
        onClick={onMoreOpen}
        className='bg-secondary-27 shadow-13 flex h-9 min-w-9 rounded-lg sm:w-auto md:hidden md:h-8 md:min-w-8 lg:hidden'
      >
        <Icon
          name='3-dots'
          className='h-6 w-6 fill-none'
        />
      </Button>
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
              filename={getCsvFileName('historical_expenses_by_networks', {
                view: activeViewTab,
                mode: activeModeTab,
                timeFrame: barSize
              })}
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
    </>
  );
};
