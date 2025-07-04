// TreasuryHoldings
export type TreasuryHolding = {
  symbol: string;
  chain: string;
  market: string;
  qty: number;
  value: number;
  price: number;
  source: string;
  [key: string]: string | number | boolean | null | undefined;
};

// TreasuryComposition
export interface TreasuryCompositionType {
  id: number;
  icon: string;
  name: string;
  balance: number;
}

// TreasuryBalanceByNetwork
export interface TreasuryBalanceByNetworkProps {
  symbol: string;
  qty: string;
  value: string;
  apr: string;
  source: string;
}

export const TREASURY_BALANCE_BY_NETWORK: TreasuryBalanceByNetworkProps[] = [
  {
    symbol: 'AAVE',
    qty: '525,030',
    value: '$162,091,830',
    apr: '0.00%',
    source: 'None'
  },
  {
    symbol: 'AAVE',
    qty: '45,383',
    value: '$14,011,123',
    apr: '0.00%',
    source: 'None'
  },
  {
    symbol: 'aEthWETH',
    qty: '4,949',
    value: '$13,751,695',
    apr: '1.94%',
    source: 'Lending'
  },
  {
    symbol: 'aEthUSDT',
    qty: '12,578,480',
    value: '$12,578,375',
    apr: '4.12%',
    source: 'Lending'
  },
  {
    symbol: 'aEthUSDC',
    qty: '12,150,743',
    value: '$12,148,313',
    apr: '3.99%',
    source: 'Lending'
  },
  {
    symbol: 'AAVE',
    qty: '28,700',
    value: '$8,860,646',
    apr: '0.00%',
    source: 'None'
  },
  {
    symbol: 'aEthLdoGHO',
    qty: '8,010,823',
    value: '$8,010,823',
    apr: '3.90%',
    source: 'Lending'
  },
  {
    symbol: 'aEthUSDS',
    qty: '6,546,635',
    value: '$6,544,157',
    apr: '3.73%',
    source: 'Lending'
  },
  {
    symbol: 'aEthLdoWETH',
    qty: '2,160',
    value: '$6,001,158',
    apr: '2.04%',
    source: 'Lending'
  },
  {
    symbol: 'WETH',
    qty: '1,601',
    value: '$4,448,945',
    apr: '0.00%',
    source: 'None'
  }
];
