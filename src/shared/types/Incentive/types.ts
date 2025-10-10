import { Source } from '@/shared/types/types';

export interface CombinedIncentivesData {
  source: Source;
  income: number;
  rewardsSupply: number;
  rewardsBorrow: number;
  compoundPrice: number;
  date: number;
}
