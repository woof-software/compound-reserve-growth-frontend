import { useEffect, useState } from 'react';

export type Legend = {
  /** Unique identifier of the legend item */
  id: string;
  /** Display the name or label of the legend item */
  name: string;
  /** Indicates whether the legend is currently disabled (e.g., hidden or inactive) */
  isDisabled: boolean;
  /** Indicates whether the legend is currently highlighted (e.g., hovered or selected) */
  isHighlighted: boolean;
  /** Associated color for the legend (for chart or visualization context) */
  color: string;
};

/**
 * A custom React hook that manages an array of `Legend` objects — typically used for
 * chart legends, map layers, or data visualization toggles.
 *
 * ## Why it exists
 * This hook provides a clean, reusable abstraction for managing the state of multiple
 * legend items — including toggling visibility, highlighting items, and resetting states.
 * It was created to reduce boilerplate when working with dynamic datasets where each
 * item needs a corresponding interactive legend entry.
 *
 * ## What it does
 * - Initializes legend states derived from arbitrary input data via a `getLegend` mapper function.
 * - Keeps legends in sync with the `data` array.
 * - Provides helper functions for enabling/disabling, highlighting/unhighlighting, and toggling legends.
 *
 * @template T The type of the original dataset item.
 * @param data - Source data array used to derive legends.
 * @param getLegend - Function that maps each data item to a `Legend` object.
 *
 * @returns Legend management API.
 */
export function useLegends<T>(data: Array<T>, getLegend: (item: T) => Legend) {
  const [legends, setLegends] = useState<Legend[]>([]);

  const currentLegends = data.map(getLegend);

  useEffect(() => {
    setLegends(currentLegends);
  }, [JSON.stringify(currentLegends)]);

  const _update = (id: string, update: (legend: Legend) => Legend) => {
    setLegends((prev) => {
      for (let i = 0; i < prev.length; i++) {
        const legend = prev[i];

        if (legend.id !== id) continue;

        const updatedLegend = update(legend);

        if (legend === updatedLegend) continue;

        const copy = [...prev];

        copy[i] = updatedLegend;

        return [...copy];
      }

      return prev;
    });
  };

  const _updateAll = (update: (legend: Legend) => Legend) => {
    setLegends((prev) => {
      let result: null | Legend[] = null;

      for (let i = 0; i < prev.length; i++) {
        const legend = prev[i];

        const updatedLegend = update(legend);

        if (legend === updatedLegend) continue;

        if (!result) {
          result = [...prev];
        }

        result[i] = updatedLegend;
      }

      return result ?? prev;
    });
  };

  const toggle = (id: string) => {
    _update(id, (legend) => {
      return {
        ...legend,
        isDisabled: !legend.isDisabled
      };
    });
  };

  const activateAll = () => {
    _updateAll((legend) => {
      if (!legend.isDisabled) return legend;

      return {
        ...legend,
        isDisabled: false
      };
    });
  };

  const deactivateAll = () => {
    _updateAll((legend) => {
      if (legend.isDisabled) return legend;

      return {
        ...legend,
        isDisabled: true
      };
    });
  };

  const highlight = (id: string) => {
    _updateAll((legend) => {
      if (legend.id === id) {
        if (legend.isHighlighted) return legend;

        return {
          ...legend,
          isHighlighted: true
        };
      }

      if (!legend.isHighlighted) return legend;

      return {
        ...legend,
        isHighlighted: false
      };
    });
  };

  const unhighlight = () => {
    _updateAll((legend) => {
      if (!legend.isHighlighted) return legend;

      return {
        ...legend,
        isHighlighted: false
      };
    });
  };

  return {
    legends,

    toggle,
    activateAll,
    deactivateAll,

    highlight,
    unhighlight
  };
}
