export const THIRTY_DAYS = 30 * 24 * 3600;

export const defaultExplorer = 'https://etherscan.io/address/';

export const units = [
  { value: 1e33, symbol: 'D' },
  { value: 1e30, symbol: 'N' },
  { value: 1e27, symbol: 'Oc' },
  { value: 1e24, symbol: 'Sp' },
  { value: 1e21, symbol: 'Sx' },
  { value: 1e18, symbol: 'Qi' },
  { value: 1e15, symbol: 'Q' },
  { value: 1e12, symbol: 'T' },
  { value: 1e9, symbol: 'B' },
  { value: 1e6, symbol: 'M' },
  { value: 1e3, symbol: 'K' }
];

export const explorers: { [key: string]: string } = {
  ethereum: 'https://etherscan.io/address/',
  mainnet: 'https://etherscan.io/address/',
  arbitrum: 'https://arbiscan.io/address/',
  avalanche: 'https://snowtrace.io/address/',
  base: 'https://basescan.org/address/',
  optimism: 'https://optimistic.etherscan.io/address/',
  polygon: 'https://polygonscan.com/address/',
  sonic: 'https://explorer.sonic.game/address/',
  linea: 'https://lineascan.build/address/',
  mantle: 'https://explorer.mantle.xyz/address/',
  ronin: 'https://app.roninchain.com/address/',
  scroll: 'https://scrollscan.com/address/',
  unichain: 'https://www.blockscout.com/search?q='
  // defaul Etherscan
};

export const shortMonthNames = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC'
];

export const longMonthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export const NO_DATA_AVAILABLE = 'No data available';

export const groupByOptions = ['Asset Type', 'Chain', 'Market'];

export const groupByOptionsWithNone = ['None', 'Asset Type', 'Chain', 'Market'];
