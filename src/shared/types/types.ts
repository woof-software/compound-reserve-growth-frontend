export const enum BAR_SIZE {
  D = 'D',
  W = 'W',
  M = 'M'
}

export const BAR_SIZE_OPTIONS = [BAR_SIZE.D, BAR_SIZE.W, BAR_SIZE.M];

export type OptionType = {
  id: string;
  label: string;
  chain?: string[];
  marketType?: string;
};


export type SortDirectionType = 'ASC' | 'DESC';


export enum AssetType {
  DEFI = 'DeFi',
  STABLECOIN = 'Stablecoin',
  BTC_CORRELATED = 'BTC Correlated',
  ETH_CORRELATED = 'ETH Correlated',
  COMP = 'COMP',
  ETHEREUM = 'Ethereum',
  UNCLASSIFIED = 'Unclassified'
}

export interface Source {
  id: number;
  address: string;
  network: string;
  type: string;
  market: string | null;
  assetId: number;
}

export interface Asset {
  id: number;
  address: string;
  decimals: number;
  symbol: string;
  network: string;
  type: string;
}