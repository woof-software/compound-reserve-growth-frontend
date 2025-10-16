export type Listener = () => void;
export type CompareFn<S> = (a: S, b: S) => boolean;

function shallowEqual<T extends Record<string, unknown>>(a: T, b: T) {
  if (Object.is(a, b)) return true;
  if (
    typeof a !== 'object' ||
    a === null ||
    typeof b !== 'object' ||
    b === null
  )
    return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const k of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, k) || !Object.is(a[k], b[k])) {
      return false;
    }
  }
  return true;
}

export class EventBus<S extends Record<string, unknown>> {
  private state: S;
  private listeners = new Set<Listener>();
  private compare: CompareFn<S>;

  constructor(initialState: S, compare: CompareFn<S> = shallowEqual) {
    this.state = initialState;
    this.compare = compare;

    this.getSnapshot = this.getSnapshot.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }

  /** React useSyncExternalStore: get current state snapshot */
  getSnapshot(): S {
    return this.state;
  }

  /** React useSyncExternalStore: subscribe to changes */
  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Replace whole state (emit only if changed by compare) */
  replace(next: S): void {
    if (!this.compare(this.state, next)) {
      this.state = next;
      this.emit();
    }
  }

  /** set via updater function (prev => next) */
  update(updater: (prev: S) => S): void {
    this.replace(updater(this.state));
  }

  /** shallow patch: merge partial into state */
  patch(partial: Partial<S>): void {
    const next = {
      ...(this.state as Record<string, unknown>),
      ...partial
    } as S;
    this.replace(next);
  }

  /** alias for patch */
  set(value: Partial<S>): void {
    this.patch(value);
  }

  /** Notify subscribers */
  protected emit(): void {
    for (const l of this.listeners) l();
  }
}
