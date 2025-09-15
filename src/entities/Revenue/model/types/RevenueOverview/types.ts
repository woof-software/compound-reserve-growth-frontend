import Highcharts from 'highcharts';

import { RevenueItem } from '@/entities/Revenue';
import { ExtendedColumnDef } from '@/shared/ui/molecules';

import { DATE_TYPE_TABS, ROLLING_TABS, TO_DATE_TABS } from '../../consts';

interface TableRowData {
  chain: string;
  [key: string]: string | number;
}

type PeriodMap = { [key: string]: number };

type RollingTab = (typeof ROLLING_TABS)[number];
type ToDateTab = (typeof TO_DATE_TABS)[number];
type DateType = (typeof DATE_TYPE_TABS)[number];
type Period = RollingTab | ToDateTab;

interface RevenueOverviewTableProps {
  data: TableRowData[];

  columns: ExtendedColumnDef<TableRowData>[];

  footerContent: React.ReactNode;

  totalFooterData: PeriodMap | null;

  dateType: DateType;

  sortType: { key: string; type: string };
}

type RevenueOverviewProps = {
  revenueData: RevenueItem[];
  isLoading: boolean;
  isError: boolean;
};

interface RevenueOverviewPieChartDataItem {
  name: string;
  percent: number;
  value: string;
  color?: string;
}

interface RevenueOverviewPieChartChartProps {
  data: RevenueOverviewPieChartDataItem[];

  isResponse?: boolean;

  responseOptions?: Highcharts.ResponsiveOptions;

  className?: string;
}

export type {
  DateType,
  Period,
  PeriodMap,
  RevenueOverviewPieChartChartProps,
  RevenueOverviewPieChartDataItem,
  RevenueOverviewProps,
  RevenueOverviewTableProps,
  RollingTab,
  TableRowData,
  ToDateTab
};
