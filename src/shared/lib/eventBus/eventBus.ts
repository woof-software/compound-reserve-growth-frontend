type SelectionState = {
  chainId: string | null;
  collateralId: string | null;
};

type Listener = () => void;

class SelectionBus {
  private state: SelectionState = { chainId: null, collateralId: null };
  private listeners = new Set<Listener>();

  getSnapshot = () => this.state;

  subscribe = (fn: Listener) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  selectChain = (chainId: string | null) => {
    this.state = { ...this.state, chainId };
    this.emit();
  };

  selectCollateral = (collateralId: string | null) => {
    this.state = { ...this.state, collateralId };
    this.emit();
  };

  setBoth = (chainId: string | null, collateralId: string | null) => {
    this.state = { chainId, collateralId };
    this.emit();
  };

  private emit() {
    for (const l of this.listeners) l();
  }
}

export const selectionBus = new SelectionBus();
