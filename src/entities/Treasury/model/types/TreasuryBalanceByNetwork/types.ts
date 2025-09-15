import { TokenData } from '@/shared/types';

type TreasuryBalanceByNetworkType = {
  symbol: string;
  qty: number;
  value: number;
  source: string;
  market: string;
  address: string;
  chain: string;
};

interface TreasuryBalanceByNetworkProps {
  isLoading?: boolean;
  isError?: boolean;
  data: TokenData[];
}

type TreasuryBalanceByNetworkTableType = {
  symbol: string;
  chain: string;
  market: string | null;
  qty: number;
  value: number;
  price: number;
  source: string;
  address: string;
};

interface TreasuryBalanceByNetworkTableProps {
  tableData: TreasuryBalanceByNetworkType[];

  sortType: { key: string; type: string };
}

export type {
  TreasuryBalanceByNetworkProps,
  TreasuryBalanceByNetworkTableProps,
  TreasuryBalanceByNetworkTableType,
  TreasuryBalanceByNetworkType
};
