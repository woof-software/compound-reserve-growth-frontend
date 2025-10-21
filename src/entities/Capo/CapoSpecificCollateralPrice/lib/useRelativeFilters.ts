import { useEffect } from 'react';
import { hashKey } from '@tanstack/react-query';

import { Option, OptionSetter } from '@/shared/types/Capo/types';

export type UseRelativeFiltersArgs = {
  chain: Option | null;
  chains: Option[];
  collaterals: Option[];
  onChainSelect: (value: OptionSetter) => void;
  onCollateralSelect: (value: OptionSetter) => void;
};

/**
 * A hook for managing and updating filters of chains and collaterals (which have a close relation)
 * in response to changes in the provided data or related filter dependencies.
 *
 * @param args - The arguments required to configure the hook.
 * @param args.chains - The list of available chains to select from.
 * @param args.collaterals - The list of available collaterals to select from.
 * @param args.chain - The currently selected chain.
 * @param args.onCollateralSelect - Callback function to manage collateral selection.
 * @param args.onChainSelect - Callback function to manage chain selection.
 *
 * @description
 * The hook utilizes multiple `useEffect` hooks to handle:
 * - Selecting the first chain when no chain is selected on initialization or data change.
 * - Selecting the first collateral when no collateral is selected on chain change.
 * - Resetting the selected collateral if the currently selected collateral no longer exists in the list of collaterals.
 *
 * Dependencies like the hash key of collaterals array and mapping of the data properties
 * are tracked to trigger effects when their values change.
 *
 * **IMPORTANT**
 *
 * This hook is designed to be used with the `useChartFilters` hook. (src/entities/Capo/CapoSpecificCollateralPrice/lib/useChartFilters.ts)
 * So, take a look at that hook for more details on how to use this hook.
 */
export const useRelativeFilters = (args: UseRelativeFiltersArgs) => {
  const { chains, collaterals, chain, onCollateralSelect, onChainSelect } =
    args;

  const chainsKey = hashKey(chains.map(({ id }) => id));
  const collateralsKey = hashKey(collaterals.map(({ id }) => id));

  useEffect(() => {
    onChainSelect((prev) => {
      if (prev) return prev;

      const firstChain = chains[0];

      if (!firstChain) return prev;

      return firstChain;
    });
  }, [chainsKey]);

  useEffect(() => {
    onCollateralSelect((prev) => {
      if (prev) return prev;

      const firstCollateral = collaterals[0];

      if (!firstCollateral) return prev;

      return firstCollateral;
    });
  }, [chain]);

  useEffect(() => {
    onCollateralSelect((prev) => {
      if (!prev) return prev;

      const isSelectedCollateralExists = collaterals.some(
        (option) => option.id === prev.id
      );

      if (isSelectedCollateralExists) return prev;

      const firstCollateral = collaterals[0];

      if (!firstCollateral) return null;

      return firstCollateral;
    });
  }, [collateralsKey]);
};
