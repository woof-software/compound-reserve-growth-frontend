import { RevenueItem } from '@/entities/Revenue';
import { ExtendedColumnDef } from '@/shared/ui/molecules';

interface ProcessedRevenueData {
  chain: string;
  [key: string]: string | number;
}

type Interval = 'Quarterly' | 'Monthly' | 'Weekly';

interface PrecomputedViewType {
  tableData: ProcessedRevenueData[];
  totals: { [key: string]: number };
  columns: ExtendedColumnDef<ProcessedRevenueData>[];
}

interface PrecomputedViews {
  quarterly: Record<string, PrecomputedViewType>;
  monthly: Record<string, PrecomputedViewType>;
  weekly: Record<string, PrecomputedViewType>;
}

interface CompoundFeeRevenueByChainGroupDrawerProps {
  isOpen: boolean;

  onClose: () => void;

  interval: {
    label: string;

    options: Interval[];

    selectedValue: Interval;
  };

  groupDynamic: {
    label: string;

    options: string[];

    selectedValue: string;
  };

  onIntervalSelect: (value: Interval) => void;

  onDynamicSelect: (value: string) => void;
}

interface CompoundFeeRevenueByChainTableProps {
  data: ProcessedRevenueData[];

  columns: ExtendedColumnDef<ProcessedRevenueData>[];

  selectedInterval: Interval;

  totals: { [key: string]: number };

  sortType: { key: string; type: string };
}

interface CompoundFeeRevenueByChainProps {
  revenueData: RevenueItem[];
  isLoading: boolean;
  isError: boolean;
}

export type {
  CompoundFeeRevenueByChainGroupDrawerProps,
  CompoundFeeRevenueByChainProps,
  CompoundFeeRevenueByChainTableProps,
  Interval,
  PrecomputedViews,
  PrecomputedViewType,
  ProcessedRevenueData
};
