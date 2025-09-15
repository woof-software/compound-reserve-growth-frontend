import { TokenData } from '@/shared/types';

type TreasuryHoldingType = {
  symbol: string;
  chain: string;
  market: string | null;
  qty: number;
  value: number;
  price: number;
  source: string;
  address: string;
};

interface TreasuryHoldingsBlockProps {
  isLoading?: boolean;
  isError?: boolean;
  data: TokenData[];
}

export type { TreasuryHoldingsBlockProps, TreasuryHoldingType };
