import { useMemo, useState } from 'react';

import SpendingsTable from '@/components/SpendingsPageTable/SpendingsTable';
import { spendingsByYear, SpendingsYear } from '@/entities/Spendings/data/spendingsData';
import { Format } from '@/shared/lib/utils/numbersFormatter';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

const YEAR_TABS: SpendingsYear[] = ['2024', '2025'];

const SpendingsLedger = () => {
  const [activeYear, setActiveYear] = useState<SpendingsYear>('2024');

  const tableData = useMemo(() => {
    return spendingsByYear[activeYear] || [];
  }, [activeYear]);

  const totalAllocate = useMemo(() => {
    return tableData.reduce(
      (acc, row) => acc + (row.allocate ?? 0),
      0
    );
  }, [tableData]);

  return (
    <Card
      title='Spendings Ledger'
      id='spendings-ledger'
      className={{
        content: 'px-0 py-0 lg:px-10 lg:py-10',
        container: 'border-background border'
      }}
    >
      <div className='flex flex-col gap-6'>
        <div className='flex flex-wrap items-center justify-between gap-4 px-5 pt-5 lg:px-0 lg:pt-0'>
          <TabsGroup
            tabs={YEAR_TABS}
            value={activeYear}
            onTabChange={setActiveYear}
          />
          <Text
            size='13'
            weight='500'
            className='text-primary-14'
          >
            Sum: {Format.price(totalAllocate, 'standard')}
          </Text>
        </div>
        <SpendingsTable
          data={tableData}
          allocateHeader={`FY${activeYear} Allocate`}
          totalAllocate={totalAllocate}
        />
      </div>
    </Card>
  );
};

export default SpendingsLedger;
