import React, { useMemo } from 'react';

import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import FullDAOCommitments from '@/components/RunwayPageTable/FullDAOCommitments';
import type { RunwayItem } from '@/shared/hooks/useRunway';
import { useRunway } from '@/shared/hooks/useRunway';
import Card from '@/shared/ui/Card/Card';

export function getStatus(
  startDate: Date,
  endDate: Date,
  now: Date = new Date()
): string {
  const nowUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const startUTC = new Date(
    Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate()
    )
  );
  const endUTC = new Date(
    Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate()
    )
  );

  return nowUTC >= startUTC && nowUTC <= endUTC ? 'active' : 'finished';
}

export function getPaidAmount(
  paymentType: string,
  startDate: Date,
  endDate: Date,
  dailyAmount: number,
  totalAmount: number,
  now: Date = new Date()
): number {
  if (paymentType !== 'Streaming Payment') {
    return totalAmount;
  }

  if (now < startDate) {
    return 0;
  }

  if (now > endDate) {
    return totalAmount;
  }

  const daysElapsed =
    (now.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
  const calculatedAmount = daysElapsed * dailyAmount;

  return Math.min(calculatedAmount, totalAmount);
}

export function getPercentagePaid(
  paidAmount: number,
  totalAmount: number
): number {
  if (totalAmount <= 0) {
    return 0;
  }
  return paidAmount / totalAmount;
}

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
      const now = new Date();

      const durationMs = endDate.getTime() - startDate.getTime();
      const durationDays =
        durationMs > 0 ? durationMs / (1000 * 60 * 60 * 24) : 0;
      const dailyAmount =
        durationDays > 0 ? item.amount / durationDays : item.amount;

      const status = getStatus(startDate, endDate, now);
      const paidAmount = getPaidAmount(
        item.paymentType,
        startDate,
        endDate,
        dailyAmount,
        item.amount,
        now
      );
      const percentagePaid = getPercentagePaid(paidAmount, item.amount);

      return {
        recipient: item.name,
        discipline: item.discipline,
        token: item.token,
        amount: item.amount,
        paymentType: item.paymentType,
        dailyStreamRate: dailyAmount,
        startDate: item.startDate,
        streamEndDate: item.endDate,
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
