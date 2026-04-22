import { useUrlSync } from '@/refactor/hooks/useUrlFilterSync'

export function useUrlSyncString(key: string, value: string) {
  return useUrlSync(key, value, {
    parse: (val: string) => val,
    stringify: (val: string) => val,
  });
}