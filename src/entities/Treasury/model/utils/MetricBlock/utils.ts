import { sumValues } from '@/shared/lib/utils';
import { AssetType } from '@/shared/types/types';

import { MetricData } from '../../types';

const mapMetricData = ({
  uniqDataByCategory,
  uniqData30DaysOldByCategory
}: MetricData) => {
  // TOTAL VALUES
  const allItems = Object.values(uniqDataByCategory).flat();
  const totalValue = sumValues(allItems);
  const totalLastValue =
    totalValue - sumValues(Object.values(uniqData30DaysOldByCategory).flat());

  // COMP VALUES
  const compItems = uniqDataByCategory[AssetType.COMP] ?? [];
  const compTotalValue = sumValues(compItems);
  const compLastValue =
    compTotalValue -
    sumValues(uniqData30DaysOldByCategory[AssetType.COMP] ?? []);

  // NON-COMP VALUES
  const nonCompItems = Object.entries(uniqDataByCategory)
    .filter(([type]) => type !== AssetType.COMP)
    .flatMap(([, items]) => items);

  const nonCompItems30DaysOld = Object.entries(uniqData30DaysOldByCategory)
    .filter(([type]) => type !== AssetType.COMP)
    .flatMap(([, items]) => items);

  const nonCompTotalValue = sumValues(nonCompItems);
  const nonCompLastValue =
    nonCompTotalValue - sumValues(nonCompItems30DaysOld ?? []);

  //STABLECOIN VALUES
  const stablecoinItems = uniqDataByCategory[AssetType.STABLECOIN] ?? [];
  const stablecoinTotalValue = sumValues(stablecoinItems);
  const stablecoinLastValue =
    stablecoinTotalValue -
    sumValues(uniqData30DaysOldByCategory[AssetType.STABLECOIN] ?? []);

  // ETH CORRELATED VALUES
  const ethCorrelatedItems = uniqDataByCategory[AssetType.ETH_CORRELATED] ?? [];
  const ethCorrelatedHoldingTotalValue = sumValues(ethCorrelatedItems);
  const ethCorrelatedHoldingLastValue =
    ethCorrelatedHoldingTotalValue -
    sumValues(uniqData30DaysOldByCategory[AssetType.ETH_CORRELATED] ?? []);

  return {
    totalValue,
    totalLastValue,

    compTotalValue,
    compLastValue,

    nonCompTotalValue,
    nonCompLastValue,

    stablecoinTotalValue,
    stablecoinLastValue,

    ethCorrelatedHoldingTotalValue,
    ethCorrelatedHoldingLastValue
  };
};

export { mapMetricData };
