import { useSourcesApiData } from '@/shared/hooks/useSourcesApiData';
import { createSourcesMap } from '@/shared/lib/utils/createSourcesMap';
import { Asset, Source } from '@/shared/types/types';

interface CombinatorContext {
  sourcesMap: Map<number, Source>;
  assetsMap: Map<number, Asset>;
}

type TransformFn<T, F> = (item: T, context: CombinatorContext) => F | null;

/**
 * This hook is replace the sourceId field with the source a field which have to store the Source object from Sources.
 * @param arr
 * @param callback
 */
export const useSourceCombinator = <T, F>(
  arr: T[] | undefined,
  callback: TransformFn<T, F>
): F[] => {
  const sourcesQuery = useSourcesApiData();
  const { sourcesMap, assetsMap } = createSourcesMap(sourcesQuery?.data);

  const context: CombinatorContext = { sourcesMap, assetsMap };
  return (
    arr?.reduce((acc, item) => {
      const callbackRes = callback(item, context);
      if (callbackRes !== null) {
        acc.push(callbackRes);
      }
      return acc;
    }, [] as F[]) ?? []
  );
};
