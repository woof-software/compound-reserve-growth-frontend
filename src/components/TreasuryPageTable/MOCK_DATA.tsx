// TreasuryHoldings
export type TreasuryHolding = {
  symbol: string;
  chain: string;
  market: string;
  wallet: string;
  qty: number;
  value: number;
  price: number;
  apr: number;
  source: string;
  [key: string]: string | number | boolean | null | undefined;
};

export const TREASURY_DATA: TreasuryHolding[] = [
  {
    symbol: 'AAVE',
    chain: 'Ethereum',
    market: 'Token Holding',
    wallet: 'Ecosystem Reserve',
    qty: 525030,
    value: 162091830,
    price: 308.73,
    apr: 0,
    source: 'None'
  },
  {
    symbol: 'AAVE',
    chain: 'Ethereum',
    market: 'Token Holding',
    wallet: 'AAVE Buyback Safe',
    qty: 45383,
    value: 14011123,
    price: 308.73,
    apr: 0,
    source: 'None'
  },
  {
    symbol: 'aEthWETH',
    chain: 'Ethereum',
    market: 'Ethereum V3',
    wallet: 'Ethereum Treasury',
    qty: 4949,
    value: 13751695,
    price: 2778.71,
    apr: 1.94,
    source: 'Lending'
  },
  {
    symbol: 'aEthUSDT',
    chain: 'Ethereum',
    market: 'Ethereum V3',
    wallet: 'Ethereum Treasury',
    qty: 12576460,
    value: 12578375,
    price: 1.0,
    apr: 4.12,
    source: 'Lending'
  },
  {
    symbol: 'aEthUSDC',
    chain: 'Ethereum',
    market: 'Ethereum V3',
    wallet: 'Ethereum Treasury',
    qty: 12150743,
    value: 12148313,
    price: 1.0,
    apr: 3.99,
    source: 'Lending'
  }
];

// TreasuryComposition
export interface TreasuryCompositionProps {
  id: number;
  name: string;
  balance: string;
}

export const TREASURY_COMPOSITION_DATA: TreasuryCompositionProps[] = [
  {
    id: 1,
    name: 'COMP',
    balance: '$184,964,799'
  },
  {
    id: 2,
    name: 'Stablecoin',
    balance: '$61,042,327'
  },
  {
    id: 3,
    name: 'ETH Correlated',
    balance: '$36,454,960'
  },
  {
    id: 4,
    name: 'DeFi',
    balance: '$12,242,498'
  },
  {
    id: 5,
    name: 'BTC Correlated',
    balance: '$5,817,676'
  },
  {
    id: 6,
    name: 'Unclassified',
    balance: '$3,886'
  }
];

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
