import { useMemo } from 'react';

import { normalizeCapoChartData } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/notmalizeCapoChartData';
import { useCapoApiData } from '@/shared/hooks/useCapoApiData';
import { useSourcesApiData } from '@/shared/hooks/useSourcesApiData';

export const useNormalizedChartData = () => {
  const capoQuery = useCapoApiData();
  const sourcesQuery = useSourcesApiData();

  const normalizedData = useMemo(() => {
    if (!capoQuery.data || !sourcesQuery.data) {
      return [];
    }

    return normalizeCapoChartData(capoQuery.data, sourcesQuery.data);
  }, [capoQuery.data, sourcesQuery.data]);

  return {
    chartData: normalizedData,
    isChartDataLoading: capoQuery.isPending || sourcesQuery.isPending,
    error: capoQuery.error || sourcesQuery.error,
    isChartDataError: capoQuery.isError || sourcesQuery.isError
  };
};
