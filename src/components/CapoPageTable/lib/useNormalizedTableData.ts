import { useMemo } from 'react';

import { normalizeCapoData } from '@/components/CapoPageTable/lib/normalizeTableDataUtils';
import { useCapoApiData } from '@/shared/hooks/useCapoApiData';
import { useSourcesApiData } from '@/shared/hooks/useSourcesApiData';

/**
 * this hook takes raw data from API and make normalization for capo table.
 */
export const useNormalizedTableData = () => {
  const capoQuery = useCapoApiData();
  const sourcesQuery = useSourcesApiData();

  const normalizedData = useMemo(() => {
    if (!capoQuery.data || !sourcesQuery.data) {
      return [];
    }

    return normalizeCapoData(capoQuery.data, sourcesQuery.data);
  }, [capoQuery.data, sourcesQuery.data]);

  return {
    data: normalizedData,
    isLoading: capoQuery.isPending || sourcesQuery.isPending,
    error: capoQuery.error || sourcesQuery.error,
    isError: capoQuery.isError || sourcesQuery.isError
  };
};
