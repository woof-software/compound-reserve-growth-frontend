import { RevenueItem } from '@/entities/Revenue';
import { BarSize, OptionType } from '@/shared/types';

interface PreprocessedItem {
  date: string;
  value: number;
  chain: string;
  market: string;
  source: string;
  symbol: string;
}

interface CompoundRevenueFilterOptions {
  chainOptions: OptionType[];
  marketOptions: OptionType[];
  sourceOptions: OptionType[];
  symbolOptions: OptionType[];
}

interface PreprocessedResult {
  filterOptions: CompoundRevenueFilterOptions;
  processedItems: PreprocessedItem[];
  initialAggregatedData: { date: string; value: number }[];
  sortedDates: string[];
}

interface CompoundRevenueFiltersProps {
  chainOptions: OptionType[];

  deploymentOptionsFilter: OptionType[];

  sourceOptions: OptionType[];

  symbolOptions: OptionType[];

  barSize: BarSize;

  isLoading: boolean;

  csvFilename: string;

  csvData: Record<string, string | number>[];

  selectedOptions: {
    chain: OptionType[];

    source: OptionType[];

    deployment: OptionType[];

    symbol: OptionType[];
  };

  onSelectChain: (chain: OptionType[]) => void;

  onSelectSource: (source: OptionType[]) => void;

  onSelectMarket: (deployment: OptionType[]) => void;

  onSelectSymbol: (symbol: OptionType[]) => void;

  onBarSizeChange: (value: string) => void;

  onClearAll: () => void;
}

interface CompoundRevenueBlockProps {
  revenueData: RevenueItem[];
  isLoading: boolean;
  isError: boolean;
}

interface ChartData {
  date: string;
  value: number;
}

interface CompoundRevenueChartProps {
  data: ChartData[];
  barSize: 'D' | 'W' | 'M';
}

export type {
  CompoundRevenueBlockProps,
  CompoundRevenueChartProps,
  CompoundRevenueFilterOptions,
  CompoundRevenueFiltersProps,
  PreprocessedItem,
  PreprocessedResult
};
