import { useMemo, useSyncExternalStore } from 'react';

import { selectionBus } from '@/shared/lib/eventBus/Capo/CapoEventBus';
import { capitalizeFirstLetter } from '@/shared/lib/utils/utils';
import { CapoNormalizedChartData } from '@/shared/types/Capo/types';

type Option = { id: string; label: string };

const makeOptions = <T extends Array<any>>(
  arr: T,
  key: string,
  t?: (s: string) => string
): Option[] =>
  Array.from(new Set(arr.map((i) => norm(i[key]))))
    .map((id) => ({ id, label: t ? t(id) : id }))
    .sort((a, b) => a.label.localeCompare(b.label));

const toId = (v: Option | string | null | undefined) =>
  !v ? null : typeof v === 'string' ? v : (v.id ?? null);

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();

const findByIdCI = (opts: Option[], id: string | null | undefined) =>
  opts.find((o) => norm(o.id) === norm(id)) ?? null;

export const useChartFiltersWithBus = (rawData: CapoNormalizedChartData[]) => {
  const snapshot = useSyncExternalStore(
    selectionBus.subscribe,
    selectionBus.getSnapshot,
    selectionBus.getSnapshot
  );

  const { chainId, collateralId } = snapshot;

  const chainOptions = useMemo(
    () => makeOptions(rawData, 'network', capitalizeFirstLetter),
    [rawData]
  );

  const selectedChain = useMemo(
    () => findByIdCI(chainOptions, chainId),
    [chainOptions, chainId]
  );

  const collateralOptions = useMemo(() => {
    const src = selectedChain
      ? rawData.filter((d) => d.network === selectedChain.id)
      : rawData;

    return makeOptions(src, 'collateral');
  }, [rawData, selectedChain]);

  const selectedCollateral = useMemo(
    () => findByIdCI(collateralOptions, collateralId),
    [collateralOptions, collateralId]
  );

  const filteredData = useMemo(() => {
    if (!selectedChain && !selectedCollateral) return [];

    return rawData.filter((i) => {
      const okChain =
        !selectedChain || norm(i.network) === norm(selectedChain.id);

      const okCol =
        !selectedCollateral ||
        norm(i.collateral) === norm(selectedCollateral.id);

      return okChain && okCol;
    });
  }, [rawData, selectedChain, selectedCollateral]);

  const groupBy = useMemo(() => {
    if (selectedChain && selectedCollateral) return 'both';

    if (selectedChain) return 'chain';

    if (selectedCollateral) return 'collateral';

    return 'none';
  }, [selectedChain, selectedCollateral]);

  const setSelectedChain = (
    v: Option | string | null | ((prev: Option | null) => Option | null)
  ) => {
    if (typeof v === 'function') {
      const next = v(selectedChain);
      selectionBus.selectChain(toId(next));
    } else {
      selectionBus.selectChain(toId(v));
    }
  };

  const setSelectedCollateral = (
    v: Option | string | null | ((prev: Option | null) => Option | null)
  ) => {
    if (typeof v === 'function') {
      const next = v(selectedCollateral);
      selectionBus.selectCollateral(toId(next));
    } else {
      selectionBus.selectCollateral(toId(v));
    }
  };

  const setBoth = (chainId: string | null, collateralId: string | null) =>
    selectionBus.setBoth(chainId, collateralId);

  return {
    selectedChain,
    selectedCollateral,
    chainOptions,
    collateralOptions,
    filteredData,
    groupBy,

    setSelectedChain,
    setSelectedCollateral,
    setBoth
  };
};
