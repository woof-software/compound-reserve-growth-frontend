import { Source } from '@/shared/types/types';

export interface NormalizedTableData {
  network: string;
  market: string;
  lendIncentive: number;
  borrowIncentive: number;
  total: number;
  source: Source;
}
