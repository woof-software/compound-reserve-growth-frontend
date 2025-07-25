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
    if (!allData.length) {
      return [];
    }

    const now = new Date();

    const tableData = allData.map((item: RunwayItem) => {
      const {
        name,
        discipline,
        token,
        value,
        paymentType,
        startDate: startStr,
        endDate: endStr,
        proposalLink: proposalLink
      } = item;

      if (!startStr || !endStr) {
        const isPaidUpfront = paymentType === 'Upfront Payment';
        return {
          recipient: name,
          discipline: discipline,
          token: token,
          amount: value,
          paymentType: paymentType,
          proposalLink: proposalLink,
          dailyStreamRate: 0,
          startDate: startStr,
          streamEndDate: endStr,
          status: 'Finished',
          paidAmount: isPaidUpfront ? value : 0,
          percentagePaid: isPaidUpfront && value > 0 ? 1 : 0
        };
      }

      const startDate = new Date(startStr);
      const endDate = new Date(endStr);
      const totalAmount = value;

      const status = now >= startDate && now <= endDate ? 'Active' : 'Finished';

      let paidAmount = 0;

      if (now < startDate) {
        paidAmount = 0;
      } else if (now > endDate) {
        paidAmount = totalAmount;
      } else {
        const durationMs = endDate.getTime() - startDate.getTime();
        const durationDays =
          durationMs > 0 ? durationMs / (1000 * 60 * 60 * 24) : 0;
        const dailyRate = durationDays > 0 ? totalAmount / durationDays : 0;

        const startOfDayNow = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const startOfDayStart = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );

        const elapsedMs = startOfDayNow.getTime() - startOfDayStart.getTime();
        const daysElapsed = elapsedMs / (1000 * 60 * 60 * 24);

        const calculatedAmount = daysElapsed * dailyRate;

        paidAmount = Math.min(calculatedAmount, totalAmount);
      }

      const percentagePaid = totalAmount > 0 ? paidAmount / totalAmount : 0;

      return {
        recipient: name,
        discipline: discipline,
        token: token,
        amount: totalAmount,
        paymentType: paymentType,
        proposalLink: proposalLink,
        dailyStreamRate: 0,
        startDate: startStr,
        streamEndDate: endStr,
        status,
        paidAmount,
        percentagePaid
      };
    });

    return tableData;
  }, [runwayResponse]);

  return (
    <Card
      title='Full DAO Commitments'
      id='full-dao-commitments'
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
