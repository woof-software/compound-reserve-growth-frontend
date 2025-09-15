import { TokenData } from '@/shared/types';

interface TreasuryCompositionType {
  id: number;
  icon: string;
  name: string;
  balance: number;
}

type CompositionData = {
  uniqData: TokenData[];
  uniqDataByCategory: Record<string, TokenData[]>;
};

interface TreasuryCompositionBlockProps {
  isLoading?: boolean;
  data: CompositionData;
}

interface TreasuryCompositionTableType {
  id: number;
  icon: string;
  name: string;
  balance: number;
  symbol?: string;
}

interface TreasuryCompositionTableProps {
  tableData: TreasuryCompositionTableType[];
  totalBalance: number;
  activeFilter: 'Chain' | 'Asset Type' | 'Market';
  sortType: { key: string; type: string };
}

export type {
  CompositionData,
  TreasuryCompositionBlockProps,
  TreasuryCompositionTableProps,
  TreasuryCompositionTableType,
  TreasuryCompositionType
};
