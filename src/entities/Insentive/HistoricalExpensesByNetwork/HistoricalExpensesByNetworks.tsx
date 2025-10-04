import React, { useState } from 'react';

import Line from '@/components/Charts/Line/Line';
import { useHistoricalExpensesChartSeries } from '@/entities/Insentive/HistoricalExpensesByNetwork/lib/useHistoricalExpensesChartSeries';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useFilterSyncSingle } from '@/shared/hooks/useFiltersSync';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

interface HistoricalExpensesByNetworksProps {
  isLoading: boolean;
  isError: boolean;
  data: CombinedIncentivesData[];
  onCopyLink?: (id: string) => void;
}

const HistoricalExpensesByNetworks = (
  props: HistoricalExpensesByNetworksProps
) => {
  const { data, isError, isLoading } = props;
  const [activeModeTab, setActiveModeTab] = useState('Total');
  const [activeViewTab, setActiveViewTab] = useState('COMP');
  const { barSize, onBarSizeChange } = useChartControls({
    initialBarSize: 'D'
  });
  const groupBy = 'Network';

  const { chartSeries, hasData } = useHistoricalExpensesChartSeries({
    rawData: data,
    mode: activeModeTab,
    view: activeViewTab
  });

  const {
    chartRef,
    showEvents,
    aggregatedSeries,
    onAllSeriesHidden,
    onEventsData,
    onShowEvents,
    onSelectAll,
    onDeselectAll
  } = useLineChart({
    groupBy,
    data: chartSeries,
    barSize
  });

  useFilterSyncSingle(
    'historicalExpByNetworkMode',
    activeModeTab,
    setActiveModeTab
  );

  useFilterSyncSingle(
    'historicalExpByNetworkView',
    activeViewTab,
    setActiveViewTab
  );

  useFilterSyncSingle('historicalExpByNetworkPeriod', barSize, onBarSizeChange);

  // const { csvData, csvFilename } = useCSVExport({
  //   chartSeries: correctedChartSeries,
  //   barSize,
  //   groupBy: 'None',
  //   filePrefix: 'Total_Treasury_Value',
  //   aggregationType: 'sum'
  // });

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Historical expenses by networks'
      id='historical-expenses-by-networks'
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-5 md:px-5 lg:px-10 lg:pb-10'
      }}
    >
      <div className='flex flex-col justify-end gap-2 px-5 py-3 sm:flex-row md:px-0'>
        <div className='flex justify-end gap-2'>
          <TabsGroup
            className={{
              container: 'hidden w-full sm:block sm:w-auto',
              list: 'w-auto'
            }}
            tabs={['COMP', 'USD']}
            value={activeViewTab}
            onTabChange={setActiveViewTab}
          />
          <TabsGroup
            className={{
              container: 'w-full sm:w-auto',
              list: 'w-full sm:w-auto'
            }}
            tabs={['Lend', 'Borrow', 'Total']}
            value={activeModeTab}
            onTabChange={setActiveModeTab}
            disabled={isLoading}
          />
          <TabsGroup
            className={{
              container: 'hidden w-full sm:block sm:w-auto',
              list: 'w-auto'
            }}
            tabs={['D', 'W', 'M']}
            value={barSize}
            onTabChange={onBarSizeChange}
            disabled={isLoading}
          />
          {/*<CSVDownloadButton*/}
          {/*  data={chartSeries}*/}
          {/*  filename={'Incentive_Current_Spending_By_Chain'}*/}
          {/*/>*/}
        </div>
      </div>
      {hasData && (
        <Line
          key={`${groupBy}`}
          data={chartSeries}
          groupBy={groupBy}
          aggregatedSeries={aggregatedSeries}
          className='max-h-fit'
          chartRef={chartRef}
          showEvents={showEvents}
          onAllSeriesHidden={onAllSeriesHidden}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
          onShowEvents={onShowEvents}
          onEventsData={onEventsData}
          isLegendEnabled={true}
          areAllSeriesHidden={false}
        />
      )}
    </Card>
  );
};

// const Filters = memo(
//   ({
//     barSize,
//     csvData,
//     csvFilename,
//     isLoading,
//     areAllSeriesHidden,
//     onBarSizeChange,
//     onSelectAll,
//     onDeselectAll
//   }: FiltersProps) => {
//     const {
//       isOpen: isMoreOpen,
//       onOpenModal: onMoreOpen,
//       onCloseModal: onMoreClose
//     } = useModal();
//
//     const onEyeClick = () => {
//       if (areAllSeriesHidden) {
//         onSelectAll();
//       } else {
//         onDeselectAll();
//       }
//
//       onMoreClose();
//     };
//
//     return (
//       <>
//         <div className='block lg:hidden'>
//           <div className='flex flex-col justify-end gap-2 px-5 py-3 sm:flex-row md:px-0'>
//             <div className='flex justify-end gap-2'>
//               <TabsGroup
//                 className={{
//                   container: 'hidden w-full sm:block sm:w-auto',
//                   list: 'w-auto'
//                 }}
//                 tabs={['COMP', 'USD']}
//                 value={'COMP'}
//                 onTabChange={() => {}}
//               />
//               <TabsGroup
//                 className={{
//                   container: 'w-full sm:w-auto',
//                   list: 'w-full sm:w-auto'
//                 }}
//                 tabs={['Lend', 'Borrow', 'Total']}
//                 value={'Borrow'}
//                 onTabChange={() => {}}
//                 disabled={isLoading}
//               />
//               <TabsGroup
//                 className={{
//                   container: 'hidden w-full sm:block sm:w-auto',
//                   list: 'w-auto'
//                 }}
//                 tabs={['D', 'W', 'M']}
//                 value={barSize}
//                 onTabChange={onBarSizeChange}
//                 disabled={isLoading}
//               />
//             </div>
//             <div className='flex flex-row items-center justify-end gap-2'>
//               <TabsGroup
//                 className={{
//                   container: 'block w-full sm:hidden',
//                   list: 'w-full'
//                 }}
//                 tabs={['COMP', 'USD']}
//                 value={'COMP'}
//                 onTabChange={() => {}}
//               />
//               <TabsGroup
//                 className={{
//                   container: 'block w-full sm:hidden',
//                   list: 'w-full'
//                 }}
//                 tabs={['D', 'W', 'M']}
//                 value={barSize}
//                 onTabChange={onBarSizeChange}
//                 disabled={isLoading}
//               />
//               <Button
//                 onClick={onMoreOpen}
//                 className='bg-secondary-27 shadow-13 flex h-9 min-w-9 rounded-lg sm:w-auto md:h-8 md:min-w-8 lg:hidden'
//               >
//                 <Icon
//                   name='3-dots'
//                   className='h-6 w-6 fill-none'
//                 />
//               </Button>
//             </div>
//           </div>
//         </div>

// MOBILE FILTERS
//         <div className='hidden lg:block'>
//           <div className='flex items-center justify-end gap-2 px-0 py-3'>
//             <TabsGroup
//               tabs={['COMP', 'USD']}
//               value={'COMP'}
//               onTabChange={() => {}}
//             />
//             <TabsGroup
//               tabs={['Lend', 'Borrow', 'Total']}
//               value={'Borrow'}
//               onTabChange={() => {}}
//               disabled={isLoading}
//             />
//             <TabsGroup
//               tabs={['D', 'W', 'M']}
//               value={barSize}
//               onTabChange={onBarSizeChange}
//               disabled={isLoading}
//             />
//             <CSVDownloadButton
//               data={csvData}
//               filename={csvFilename}
//               tooltipContent='CSV with the entire historical data can be downloaded'
//             />
//           </div>
//         </div>
//         <Drawer
//           isOpen={isMoreOpen}
//           onClose={onMoreClose}
//         >
//           <Text
//             size='17'
//             weight='700'
//             align='center'
//             className='mb-5'
//           >
//             Actions
//           </Text>
//           <div className='flex flex-col gap-1.5'>
//             <div className='px-3 py-2'>
//               <CSVLink
//                 data={csvData}
//                 filename={csvFilename}
//                 onClick={onMoreClose}
//               >
//                 <div className='flex items-center gap-1.5'>
//                   <Icon
//                     name='download'
//                     className='h-[26px] w-[26px]'
//                   />
//                   <Text
//                     size='14'
//                     weight='500'
//                   >
//                     CSV with the entire historical data
//                   </Text>
//                 </div>
//               </CSVLink>
//             </div>
//             <div className='px-3 py-2'>
//               <ChartIconToggle
//                 active={areAllSeriesHidden}
//                 onIcon='eye'
//                 offIcon='eye-closed'
//                 ariaLabel='Toggle all series visibility'
//                 className={{
//                   container:
//                     'flex items-center gap-1.5 bg-transparent p-0 !shadow-none',
//                   icon: 'h-[26px] w-[26px]',
//                   iconContainer: 'h-[26px] w-[26px]'
//                 }}
//                 onClick={onEyeClick}
//               >
//                 <Text
//                   size='14'
//                   weight='500'
//                 >
//                   Unselect All
//                 </Text>
//               </ChartIconToggle>
//             </div>
//           </div>
//         </Drawer>
//       </>
//     );
//   }
// );

export default HistoricalExpensesByNetworks;
