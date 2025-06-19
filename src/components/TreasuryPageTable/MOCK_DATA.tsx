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
};

export const treasuryData: TreasuryHolding[] = [
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
