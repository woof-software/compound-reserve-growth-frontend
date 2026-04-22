import { useUrlSync } from '@/refactor/hooks/useUrlFilterSync'


export function useUrlSyncStingsArray(key: string, value: string[]) {
  return useUrlSync(key, value, {
    parse: (raw) => raw.split('_'),
    stringify: (value) => {
      if (Array.isArray(value) && !value.length) {
        return ''
      }

      return value.map((v) => v.replace(/_/g, '-')).join('_');
    },
  });
}