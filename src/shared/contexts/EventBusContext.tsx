import React, { createContext, useContext } from 'react';

export type EventsMap = {
  // where P is the event name and unknown is the event payload
  [P: string]: unknown;
};

export type EventBusContextModel<T extends EventsMap> = {
  emit: <K extends keyof T>(key: K, payload: T[K]) => void;
  on: <K extends keyof T>(
    key: K,
    listener: (payload: T[K]) => void
  ) => () => void;
  off: <K extends keyof T>(key: K, listener: (payload: T[K]) => void) => void;
};

type Listeners<Events extends EventsMap> = {
  [s in keyof Events]: Set<(a: Events[s]) => void>;
};

/**
 * Creates a new event bus context with provider and hooks for managing events.
 *
 * @template T The shape of the events map defining allowed event names and their payload types.
 * @return An object containing the `Provider` component and `use` hook for accessing the event bus.
 *         The `Provider` component is used to supply the event bus to the component tree.
 *         The `use` hook provides access to the event bus for emitting, subscribing from React components,
 *         and unsubscribing from events.
 */
function spawn<T extends EventsMap>() {
  const listeners = {} as Listeners<T>;

  function emit<K extends keyof T>(key: K, payload: T[K]) {
    const _listeners = listeners[key] ?? [];

    _listeners.forEach((listener) => listener(payload));
  }

  function on<K extends keyof T>(
    key: K,
    listener: (payload: T[K]) => void
  ): () => void {
    const _listeners = listeners[key] ?? new Set();

    _listeners.add(listener);

    listeners[key] = _listeners;

    return () => {
      off(key, listener);
    };
  }

  function off<K extends keyof T>(key: K, listener: (payload: T[K]) => void) {
    const _listeners = listeners[key] ?? new Set();

    _listeners.delete(listener);

    listeners[key] = _listeners;
  }

  const model: EventBusContextModel<T> = {
    emit,
    on,
    off
  };

  const context = createContext<EventBusContextModel<T> | null>(null);

  const Provider = ({ children }: React.PropsWithChildren) => {
    return <context.Provider value={model}>{children}</context.Provider>;
  };

  const use = () => {
    const model = useContext(context);

    if (!model) {
      throw new Error('EventBusContext must be used within a Provider');
    }

    return model;
  };

  return { Provider, use };
}

export const EventBusContext = {
  spawn
};
