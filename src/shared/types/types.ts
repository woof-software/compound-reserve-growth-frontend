import { Source } from '@/shared/types/Treasury/types';

export type FilterItem = {
  id: string;

  title: string;

  placeholder: string;

  options: string[];
};

export type TimeRange = '7B' | '30B' | '90B' | '180B';
export type BarSize = 'D' | 'W' | 'M';

export type OptionType = { id: string; label: string };

export type SortDirectionType = 'ASC' | 'DESC';

export type ResponseDataType = {
  date: number;

  source: Source;
};

export enum AssetType {
  DEFI = 'DeFi',
  STABLECOIN = 'Stablecoin',
  BTC_CORRELATED = 'BTC Correlated',
  ETH_CORRELATED = 'ETH Correlated',
  COMP = 'COMP',
  ETHEREUM = 'Ethereum',
  UNCLASSIFIED = 'Unclassified'
}

export enum SourceType {
  TIMELOCK = 'Timelock',
  MARKET_V2 = 'Market V2',
  MARKET_V3 = 'Market V3',
  COMPTROLLER = 'Comptroller',
  AVANTGARDE_TREASURY_GROWTH_PROPOSAL = 'Avantgarde Treasury Growth Proposal',
  AERA_COMPOUND_RESERVES = 'Aera Compound Reserves',
  AERA_VENDORS_VAULT = 'Aera Vendors Vault'
}
