import React, { useMemo } from 'react';

import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import FullDAOCommitments from '@/components/RunwayPageTable/FullDAOCommitments';
import type { RunwayItem } from '@/shared/hooks/useRunway';
import { useRunway } from '@/shared/hooks/useRunway';
import Card from '@/shared/ui/Card/Card';

/*
1. Takes all commitments (providers and initiatives) without any filtering by date or type.
2. For each row, calculates the "Daily Stream Rate" in USD equivalent.
3. Formula: The total value in USD (`item.value`) is divided by the full duration of the period in days (`startDate` - `endDate`).
*/

const FullDAOCommitmentsBlock = () => {
  const { data: runwayResponse, isLoading, isError } = useRunway();

  const processedData = useMemo(() => {
    const allData = runwayResponse?.data || [];
    if (!allData.length) {
      return [];
    }

    const tableData = allData.map((item: RunwayItem) => {
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);

      const durationMs = endDate.getTime() - startDate.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24) + 1;

      let dailyStreamRate = 0;
      if (durationDays > 0) {
        dailyStreamRate = item.value / durationDays;
      }

      return {
        recipient: item.name,
        discipline: item.discipline,
        token: item.token,
        amount: item.amount,
        paymentType: item.paymentType,
        dailyStreamRate: dailyStreamRate,
        startDate: item.startDate,
        streamEndDate: item.endDate
      };
    });

    return tableData;
  }, [runwayResponse]);

  return (
    <Card
      title='Full DAO Commitments'
      isLoading={isLoading}
      isError={isError}
      className={{
        content: 'flex flex-col gap-3 px-10 pt-0 pb-10',
        loading: 'min-h-[571px]'
      }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
        <CSVDownloadButton
          data={processedData}
          filename='Full DAO Commitments'
        />
      </div>
      <FullDAOCommitments data={processedData} />
    </Card>
  );
};

export default FullDAOCommitmentsBlock;
