import { useUrlSync } from '@/shared/hooks/filters/useUrlSync';


/**
 * Synchronizes an array of strings with the URL, parsing and stringifying the data as needed.
 *
 * {string} key - The key used to associate the data with a specific URL parameter.
 * {string[]} value - The array of strings to sync with the URL.
 */
export function useUrlSyncStingsArray(key: string, value: string[]) {
  return useUrlSync(key, value, {
    parse: (raw) => raw.split('_'),
    stringify: (value) => {
      if (Array.isArray(value) && !value.length) {
        return '';
      }

      return value.join('_');
    },
  });
}