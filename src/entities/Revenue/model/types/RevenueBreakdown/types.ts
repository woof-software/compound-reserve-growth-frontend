import { RevenueItem } from '@/entities/Revenue';
import { OptionType } from '@/shared/types';
import { ExtendedColumnDef } from '@/shared/ui/molecules';

interface FormattedRevenueData {
  chain: string;
  market: string;
  source: string;
  reserveAsset: string;
  [key: string]: string | number;
}

interface RevenueBreakdownProps {
  data: FormattedRevenueData[];
  columns: ExtendedColumnDef<FormattedRevenueData>[];
  sortType:
    | { key: string; type: 'asc' | 'desc' }
    | { key: string; type: string };
}

type ColKey = { accessorKey: string; header: string };

interface SelectedFiltersState {
  chain: OptionType[];
  market: OptionType[];
  source: OptionType[];
  symbol: OptionType[];
}

interface RevenueBreakDownBlockProps {
  revenueData: RevenueItem[];
  isLoading: boolean;
  isError: boolean;
}

export type {
  ColKey,
  FormattedRevenueData,
  RevenueBreakDownBlockProps,
  RevenueBreakdownProps,
  SelectedFiltersState
};
