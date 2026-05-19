import { FormattedRevenueData } from '@/components/RevenuePageTable/RevenueBreakdown';
import { NOT_MARKET } from '@/shared/consts/consts';
import { RevenueItem } from '@/shared/hooks/useRevenue';
import { Format } from '@/shared/lib/utils/format';
import { capitalizeFirstLetter } from '@/shared/lib/utils/utils';
import { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';

const QUARTERS = [1, 2, 3, 4] as const;

export interface BreakdownTableContext {
  yearToDisplay: string;
  showMarketColumn: boolean;
  showSourceColumn: boolean;
  showReserveAssetColumn: boolean;
}

export const createBreakdownTableContext = (
  yearToDisplay: string,
  hasMarketFilter: boolean,
  hasSourceFilter: boolean,
  hasSymbolFilter: boolean
): BreakdownTableContext => ({
  yearToDisplay,
  showMarketColumn: hasMarketFilter || hasSourceFilter,
  showSourceColumn: hasSourceFilter,
  showReserveAssetColumn: hasSourceFilter || hasSymbolFilter
});

export const buildBreakdownColumns = (
  ctx: BreakdownTableContext
): ExtendedColumnDef<FormattedRevenueData>[] => {
  if (!ctx.yearToDisplay) {
    return [];
  }

  const { yearToDisplay } = ctx;
  const columns: ExtendedColumnDef<FormattedRevenueData>[] = [
    { accessorKey: 'chain', header: 'Chain' }
  ];

  if (ctx.showMarketColumn) {
    columns.push({ accessorKey: 'market', header: 'Market' });
  }

  if (ctx.showSourceColumn) {
    columns.push({ accessorKey: 'source', header: 'Source' });
  }

  if (ctx.showReserveAssetColumn) {
    columns.push({ accessorKey: 'reserveAsset', header: 'Reserve Asset' });
  }

  QUARTERS.forEach((quarter) => {
    columns.push({
      accessorKey: `q${quarter}_${yearToDisplay}`,
      header: `Q${quarter} ${yearToDisplay}`,
      cell: ({ getValue }) => Format.price(Number(getValue()), 'standard')
    });
  });

  return columns;
};

export const aggregateBreakdownItem = (
  item: RevenueItem,
  groupedData: Record<string, FormattedRevenueData>,
  ctx: BreakdownTableContext
) => {
  const marketValue = item.source.market || NOT_MARKET;
  const keyParts = [item.source.network];

  if (ctx.showMarketColumn) {
    keyParts.push(marketValue);
  }

  if (ctx.showSourceColumn) {
    keyParts.push(item.source.type);
  }

  if (ctx.showReserveAssetColumn) {
    keyParts.push(item.source.asset.symbol);
  }

  const groupKey = keyParts.join('-');
  const { yearToDisplay } = ctx;

  if (!groupedData[groupKey]) {
    const row: FormattedRevenueData = {
      chain: capitalizeFirstLetter(item.source.network),
      market: marketValue,
      source: item.source.type,
      reserveAsset: item.source.asset.symbol
    };

    QUARTERS.forEach((quarter) => {
      row[`q${quarter}_${yearToDisplay}`] = 0;
    });

    groupedData[groupKey] = row;
  }

  const date = new Date(item.date * 1000);
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  const quarterKey = `q${quarter}_${yearToDisplay}`;
  (groupedData[groupKey][quarterKey] as number) += item.value;
};
