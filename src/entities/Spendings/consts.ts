import {
  type SpendingsRow,
  SpendingsYear
} from '@/entities/Spendings/data/spendingsData';
import { SortAccessor } from '@/shared/hooks/useSorting';

export const YEAR_TABS: SpendingsYear[] = ['2024', '2025'];

export const spendingsSortColumns: SortAccessor<SpendingsRow>[] = [
  { accessorKey: 'counterpartyService', header: 'Counterparty / Service' },
  { accessorKey: 'renewalExpiry', header: 'Renewal / Status' },
  { accessorKey: 'activeDaysInFY', header: 'Details' }
];
