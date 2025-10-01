export type FilterItem = {
  id: string;

  title: string;

  placeholder: string;

  options: string[];
};

export type BarSize = 'D' | 'W' | 'M';

export type OptionType = {
  id: string;
  label: string;
  chain?: string[];
  marketType?: string;
};

export type ValueOf<T> = T[keyof T];

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
