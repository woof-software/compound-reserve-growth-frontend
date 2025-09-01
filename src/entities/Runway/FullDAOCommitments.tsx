import React, { useCallback, useMemo, useReducer } from 'react';

import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import FullDAOCommitments from '@/components/RunwayPageTable/FullDAOCommitments';
import SortDrawer from '@/components/SortDrawer/SortDrawer';
import { useModal } from '@/shared/hooks/useModal';
import type { RunwayItem } from '@/shared/hooks/useRunway';
import { useRunway } from '@/shared/hooks/useRunway';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Icon from '@/shared/ui/Icon/Icon';

export const fullDAOCommitmentsColumns = [
  {
    accessorKey: 'recipient',
    header: 'Recipient'
  },
  {
    accessorKey: 'discipline',
    header: 'Discipline'
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    accessorKey: 'amount',
    header: 'Amount (Qty)'
  },
  {
    accessorKey: 'paidAmount',
    header: 'Paid Amount'
  },
  {
    accessorKey: 'percentagePaid',
    header: '% Paid'
  },
  {
    accessorKey: 'paymentType',
    header: 'Payment Type'
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date'
  },
  {
    accessorKey: 'streamEndDate',
    header: 'End Date'
  }
];

const FullDAOCommitmentsBlock = () => {
  const [sortType, setSortType] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    { key: '', type: 'asc' }
  );

  const { data: runwayResponse, isLoading, isError } = useRunway();

  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

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

      let status: string;
      if (now < startDate) {
        status = 'Pending';
      } else if (now > endDate) {
        status = 'Finished';
      } else {
        status = 'Active';
      }

      let paidAmount = 0;

      if (paymentType === 'Upfront Payment') {
        paidAmount = now >= startDate ? totalAmount : 0;
      } else {
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

  const onKeySelect = useCallback((value: string) => {
    setSortType({
      key: value
    });
  }, []);

  const onTypeSelect = useCallback((value: string) => {
    setSortType({
      type: value
    });
  }, []);

  return (
    <Card
      title='Full DAO Commitments'
      id='full-dao-commitments'
      isLoading={isLoading}
      isError={isError}
      className={{
        content: 'flex flex-col p-0 lg:gap-3 lg:px-10 lg:pb-10',
        loading: 'min-h-[571px]'
      }}
    >
      <div className='flex justify-end gap-3 px-5 py-3 md:px-6 lg:px-0'>
        <div className='block lg:hidden'>
          <Button
            onClick={onSortOpen}
            className='bg-secondary-27 outline-secondary-18 text-gray-11 shadow-13 flex min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold'
          >
            <Icon
              name='sort-icon'
              className='h-[14px] w-[14px]'
            />
            Sort
          </Button>
        </div>
        <CSVDownloadButton
          data={processedData}
          filename='Full DAO Commitments'
        />
      </div>
      <FullDAOCommitments
        sortType={sortType}
        data={processedData}
      />
      <SortDrawer
        isOpen={isSortOpen}
        sortType={sortType}
        columns={fullDAOCommitmentsColumns}
        onClose={onSortClose}
        onKeySelect={onKeySelect}
        onTypeSelect={onTypeSelect}
      />
    </Card>
  );
};

export default FullDAOCommitmentsBlock;
