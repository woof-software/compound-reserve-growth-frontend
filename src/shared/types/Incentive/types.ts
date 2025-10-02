import { Source } from '@/shared/types/types';

export interface CombinedIncentivesData {
  source: Source;
  incomes: {
    id: number;
    valueBorrow: number;
    valueSupply: number;
  };
  spends?: {
    id: number;
    valueBorrow: number;
    valueSupply: number;
  };
  date: number;
  compoundPrice: number;
}
