import { useUrlSync } from '@/refactor/hooks/useUrlFilterSync'


export function useUrlSyncStingsArray(key: string, value: string[]) {
  // TODO: убрать лишние символы из юрла и сделать ttv-symbol=AAVE,USDT&ttv-date=2023-01-01,2023-01-31
  return useUrlSync(key, value, {
    parse: JSON.parse,
    stringify: (value) => {
      if (Array.isArray(value) && !value.length) {
        return ''
      }
      return JSON.stringify(value);
    },
  });
}