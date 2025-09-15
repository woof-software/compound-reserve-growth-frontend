import { RefObject } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { RevenueItem } from '@/entities/Revenue';
import { AggregatedPoint } from '@/shared/hooks';
import { BarSize, OptionType } from '@/shared/types';

interface SelectedOptionsState {
  chain: OptionType[];
  market: OptionType[];
  symbol: OptionType[];
  assetType: OptionType[];
}

interface StackedChartData {
  date: string;
  [key: string]: string | number;
}

interface CompoundFeeRevenueReceivedFiltersProps {
  chainOptions: OptionType[];

  deploymentOptionsFilter: OptionType[];

  assetTypeOptions: OptionType[];

  symbolOptions: OptionType[];

  barSize: BarSize;

  isShowEyeIcon: boolean;

  isLoading: boolean;

  openSingle: boolean;

  groupBy: string;

  csvFilename: string;

  areAllSeriesHidden: boolean;

  csvData: Record<string, string | number>[];

  selectedOptions: {
    chain: OptionType[];

    assetType: OptionType[];

    market: OptionType[];

    symbol: OptionType[];
  };

  onSelectChain: (chain: OptionType[]) => void;

  onSelectAssetType: (assetType: OptionType[]) => void;

  onSelectMarket: (market: OptionType[]) => void;

  onSelectSymbol: (symbol: OptionType[]) => void;

  onBarSizeChange: (value: string) => void;

  toggleSingle: () => void;

  closeSingle: () => void;

  onClearAll: () => void;

  onSelectAll: () => void;

  onDeselectAll: () => void;

  selectSingle: (value: string) => void;
}

interface CompoundFeeReceivedChartProps {
  seriesData: Highcharts.SeriesColumnOptions[];

  chartRef: RefObject<HighchartsReact.RefObject | null>;

  aggregatedData: AggregatedPoint[];

  groupBy: string;

  hiddenItems: Set<string>;

  areAllSeriesHidden: boolean;

  barCount?: number;

  barSize?: 'D' | 'W' | 'M';

  className?: string;

  toggleSeriesByName: (name: string) => void;

  onSelectAll: () => void;

  onDeselectAll: () => void;

  onVisibleBarsChange?: (count: number) => void;
}

interface CompoundFeeRevenueReceivedProps {
  revenueData: RevenueItem[];
  isLoading: boolean;
  isError: boolean;
}

export type {
  CompoundFeeReceivedChartProps,
  CompoundFeeRevenueReceivedFiltersProps,
  CompoundFeeRevenueReceivedProps,
  SelectedOptionsState,
  StackedChartData
};
