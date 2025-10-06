import { useMemo } from 'react';

import { getHistoricalExpensesFilteredData } from '@/entities/Insentive/HistoricalExpensesByNetwork/lib/getHistoricalExpensesFilteredData';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';

interface UseIncentivesChartDataProps {
  rawData: CombinedIncentivesData[];
  mode: string;
  view: string;
}

/**
 * A custom hook to process and format incentives data for the line chart.
 *
 * @param rawData - The array of data fetched from your API.
 * @param mode - The currently active mode ('Lend', 'Borrow', 'Total').
 * @param view - The currently active view ('COMP', 'USD').
 * @returns An object containing the chart-ready series and a boolean indicating if data exists.
 */
export const useHistoricalExpensesChartSeries = ({
  rawData,
  mode,
  view
}: UseIncentivesChartDataProps) => {
  const chartSeries = useMemo(() => {
    const groupedByNetwork = getHistoricalExpensesFilteredData(
      rawData,
      mode,
      view
    );

    return Object.entries(groupedByNetwork).map(
      ([networkName, dataPoints]) => ({
        name: networkName,
        data: dataPoints.sort((a, b) => a.x - b.x)
      })
    );
  }, [rawData, mode, view]);

  const hasData = chartSeries.length > 0;

  return { chartSeries, hasData };
};
