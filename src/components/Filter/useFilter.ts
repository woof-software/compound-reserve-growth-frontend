import { useCallback, useReducer } from 'react';

import type { SelectedFiltersType } from '@/components/Filter/Filter';

type Action =
  | { type: 'TOGGLE_ITEM'; id: string; item: string }
  | { type: 'APPLY' }
  | { type: 'CLEAR' }
  | { type: 'RESET'; payload: SelectedFiltersType[] };

interface State {
  local: SelectedFiltersType[];

  applied: SelectedFiltersType[];
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'TOGGLE_ITEM': {
      const { id, item } = action;

      const exists = state.local.find((f) => f.id === id);

      if (exists) {
        const updated = state.local.map((f) =>
          f.id === id
            ? {
                id,
                selectedItems: f.selectedItems.includes(item)
                  ? f.selectedItems.filter((x) => x !== item)
                  : [...f.selectedItems, item]
              }
            : f
        );
        return { ...state, local: updated };
      }
      return {
        ...state,
        local: [...state.local, { id, selectedItems: [item] }]
      };
    }

    case 'APPLY':
      return { applied: state.local, local: state.local };
    case 'CLEAR':
      return { local: [], applied: [] };

    case 'RESET':
      return { local: action.payload, applied: action.payload };

    default:
      return state;
  }
};

export const useFilter = (initial: SelectedFiltersType[] = []) => {
  const [state, dispatch] = useReducer(reducer, {
    local: initial,
    applied: initial
  });

  const toggle = useCallback((id: string, item: string) => {
    dispatch({ type: 'TOGGLE_ITEM', id, item });
  }, []);

  const apply = useCallback(() => dispatch({ type: 'APPLY' }), []);

  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const reset = useCallback(
    () => dispatch({ type: 'RESET', payload: state.applied }),
    [state.applied]
  );

  return {
    selected: state.applied,
    local: state.local,
    toggle,
    apply,
    clear,
    reset
  };
};
