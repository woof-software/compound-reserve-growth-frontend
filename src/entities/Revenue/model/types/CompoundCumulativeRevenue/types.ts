import { RefObject } from 'react';
import { SeriesAreaOptions } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { RevenueItem } from '@/entities/Revenue';
import { EventDataItem } from '@/shared/hooks';
import { BarSize, OptionType } from '@/shared/types';

interface CompoundCumulativeRevenueFilterProps {
  chainOptions: OptionType[];

  deploymentOptionsFilter: OptionType[];

  assetTypeOptions: OptionType[];

  symbolOptions: OptionType[];

  barSize: BarSize;

  isLoading: boolean;

  showEvents: boolean;

  isShowCalendarIcon: boolean;

  csvFilename: string;

  csvData: Record<string, string | number>[];

  selectedOptions: {
    chain: OptionType[];

    assetType: OptionType[];

    deployment: OptionType[];

    symbol: OptionType[];
  };

  isShowEyeIcon: boolean;

  areAllSeriesHidden: boolean;

  onSelectChain: (chain: OptionType[]) => void;

  onSelectAssetType: (assetType: OptionType[]) => void;

  onSelectMarket: (deployment: OptionType[]) => void;

  onSelectSymbol: (symbol: OptionType[]) => void;

  onBarSizeChange: (value: string) => void;

  onClearAll: () => void;

  onShowEvents: (value: boolean) => void;

  onSelectAll: () => void;

  onDeselectAll: () => void;
}

interface CompoundCumulativeRevenueLineDataItem {
  x: number;
  y: number;
}

interface CompoundCumulativeRevenueLineChartSeries {
  name: string;
  data: CompoundCumulativeRevenueLineDataItem[];
}

interface CompoundCumulativeRevenueLineChartProps {
  data: CompoundCumulativeRevenueLineChartSeries[];

  groupBy: string;

  chartRef: RefObject<HighchartsReact.RefObject | null>;

  isLegendEnabled: boolean;

  eventsData?: EventDataItem[];

  aggregatedSeries: SeriesAreaOptions[];

  showEvents: boolean;

  areAllSeriesHidden: boolean;

  className?: string;

  onAllSeriesHidden: (value: boolean) => void;

  onSelectAll: () => void;

  onDeselectAll: () => void;

  onShowEvents: (value: boolean) => void;

  onEventsData: (value: EventDataItem[]) => void;
}

type CompoundCumulativeRevenueProps = {
  revenueData: RevenueItem[];
  isLoading: boolean;
  isError: boolean;
};

export type {
  CompoundCumulativeRevenueFilterProps,
  CompoundCumulativeRevenueLineChartProps,
  CompoundCumulativeRevenueProps
};
