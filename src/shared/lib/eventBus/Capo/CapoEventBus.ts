import { EventBus } from '../eventBus';

export type SelectionState = {
  chainId: string | null;
  collateralId: string | null;
};

const norm = (s: string | null | undefined) =>
  (s ?? '').trim().toLowerCase() || null;

export class SelectionBus extends EventBus<SelectionState> {
  constructor() {
    super({ chainId: null, collateralId: null });
  }

  selectChain = (chainId: string | null) => {
    this.patch({ chainId: norm(chainId) });
  };

  selectCollateral = (collateralId: string | null) => {
    this.patch({ collateralId: norm(collateralId) });
  };

  setBoth = (chainId: string | null, collateralId: string | null) => {
    this.patch({ chainId: norm(chainId), collateralId: norm(collateralId) });
  };
}

export const selectionBus = new SelectionBus();
