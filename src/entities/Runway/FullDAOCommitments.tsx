import React, { useMemo } from 'react';

import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import FullDAOCommitments from '@/components/RunwayPageTable/FullDAOCommitments';
import type { RunwayItem } from '@/shared/hooks/useRunway';
import { useRunway } from '@/shared/hooks/useRunway';
import Card from '@/shared/ui/Card/Card';

const FullDAOCommitmentsBlock = () => {
  const { data: runwayResponse, isLoading, isError } = useRunway();

  const processedData = useMemo(() => {
    const allData = runwayResponse?.data || [];

    const tableData = allData.map((item: RunwayItem) => ({
      recipient: item.name,
      discipline: item.discipline,
      token: item.token,
      amount: item.amount,
      paymentType: item.paymentType,
      dailyStreamRate: 0,
      startDate: item.startDate,
      streamEndDate: item.endDate
    }));

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
