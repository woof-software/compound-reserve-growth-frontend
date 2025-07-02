import { AssetType } from '@/shared/types/types';

export interface TokenData {
  id: number;
  quantity: string;
  price: number;
  value: number;
  date: number;
  source: Source;
}

export interface Source {
  id: number;
  address: string;
  network: string;
  market: string;
  asset: Asset;
}

export interface Asset {
  id: number;
  address: string;
  decimals: number;
  symbol: string;
  network: string;
  type: AssetType;
}
