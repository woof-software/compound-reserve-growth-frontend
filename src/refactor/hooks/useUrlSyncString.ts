import { useUrlSync } from '@/refactor/hooks/useUrlFilterSync'

/**
 * Synchronizes a string value with a URL query parameter.
 *
 * @param {string} key - The key of the URL query parameter to synchronize with.
 * @param {string} value - The initial string value to synchronize.
 */
export function useUrlSyncString(key: string, value: string) {
  return useUrlSync(key, value, {
    parse: (val: string) => val,
    stringify: (val: string) => val,
  });
}