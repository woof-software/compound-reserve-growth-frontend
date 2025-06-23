// AnnualisedExpenses
export interface AnnualisedExpensesProps {
  discipline: string;
  compound: number;
  stablecoins: number;
  eth: number;
  value: number;
}

export const ANNUALISED_EXPENSES_DATA: AnnualisedExpensesProps[] = [
  {
    discipline: 'Growth',
    compound: 500,
    stablecoins: 27500000,
    eth: 3200,
    value: 37495000
  },
  {
    discipline: 'Technical',
    compound: 8000,
    stablecoins: 16600000,
    eth: 0,
    value: 17800000
  },
  {
    discipline: 'Risk',
    compound: 0,
    stablecoins: 3000000,
    eth: 0,
    value: 3000000
  },
  {
    discipline: 'Security',
    compound: 3667,
    stablecoins: 2380000,
    eth: 0,
    value: 2930000
  },
  {
    discipline: 'Marketing',
    compound: 0,
    stablecoins: 1300000,
    eth: 0,
    value: 1300000
  },
  {
    discipline: 'Finance',
    compound: 0,
    stablecoins: 1000000,
    eth: 0,
    value: 1000000
  },
  {
    discipline: 'Governance',
    compound: 0,
    stablecoins: 240000,
    eth: 0,
    value: 240000
  },
  {
    discipline: 'Operations',
    compound: 0,
    stablecoins: 0,
    eth: 0,
    value: 48720
  }
];

// CurrentServiceProviders
export interface ProviderProps {
  provider: string;
  discipline: string;
  compound: number;
  stablecoin: number;
  value: number;
}

export const PROVIDER_DATA: ProviderProps[] = [
  {
    provider: 'Aave Labs',
    discipline: 'Technical',
    compound: 0,
    stablecoin: 13300000,
    value: 13300000
  },
  {
    provider: 'Bored Ghosts Developing',
    discipline: 'Technical',
    compound: 8000,
    stablecoin: 4600000,
    value: 5800000
  },
  {
    provider: 'Aave Chan Initiative',
    discipline: 'Growth',
    compound: 0,
    stablecoin: 3000000,
    value: 3000000
  },
  {
    provider: 'Chaos Labs',
    discipline: 'Risk',
    compound: 0,
    stablecoin: 2000000,
    value: 2000000
  },
  {
    provider: 'Certora',
    discipline: 'Security',
    compound: 3667,
    stablecoin: 1150000,
    value: 1700000
  },
  {
    provider: 'TokenLogic',
    discipline: 'Finance',
    compound: 0,
    stablecoin: 1000000,
    value: 1000000
  },
  {
    provider: 'LlamaRisk',
    discipline: 'Risk',
    compound: 0,
    stablecoin: 1000000,
    value: 1000000
  },
  {
    provider: 'karpatkey',
    discipline: 'Growth',
    compound: 0,
    stablecoin: 500000,
    value: 500000
  }
];

// CurrentInitiative
export interface CurrentInitiativeProps {
  initiative: string;
  discipline: string;
  token: string;
  amount: number;
  value: number;
}

export const CURRENT_INITIATIVES_DATA: CurrentInitiativeProps[] = [
  {
    initiative: 'Aave Liquidity Committee',
    discipline: 'Growth',
    token: 'aEthLidoGHO',
    amount: 0,
    value: 12000000
  },
  {
    initiative: 'Merit Program',
    discipline: 'Growth',
    token: 'aEthLidoGHO',
    amount: 0,
    value: 12000000
  },
  {
    initiative: 'Ahab Program',
    discipline: 'Growth',
    token: 'ETH',
    amount: 3200,
    value: 9920000
  },
  {
    initiative: 'Immunefi Bug Bounty',
    discipline: 'Security',
    token: 'aEthUSDC',
    amount: 0,
    value: 1000000
  },
  {
    initiative: 'Orbit Program',
    discipline: 'Governance',
    token: 'aEthLidoGHO',
    amount: 0,
    value: 240000
  },
  {
    initiative: 'Centrifuge',
    discipline: 'Growth',
    token: 'AAVE',
    amount: 500,
    value: 75000
  },
  {
    initiative: 'Skywards Gas',
    discipline: 'Operations',
    token: 'aEthWETH',
    amount: 12,
    value: 28800
  },
  {
    initiative: 'Dolce Vita Gas',
    discipline: 'Operations',
    token: 'aEthWETH',
    amount: 5,
    value: 12000
  },
  {
    initiative: 'aDAI BOT',
    discipline: 'Operations',
    token: 'aPolWMATIC',
    amount: 10000,
    value: 4000
  },
  {
    initiative: 'Aave Robot',
    discipline: 'Operations',
    token: 'aPolWMATIC',
    amount: 8000,
    value: 3200
  },
  {
    initiative: 'Aave Robot',
    discipline: 'Operations',
    token: 'aEthLINK',
    amount: 60,
    value: 720
  }
];

// FullDAOCommitment
export interface FullDAOCommitmentProps {
  recipient: string;
  discipline: string;
  token: string;
  amount: string;
  paymentType: string;
  dailyStreamRate: string;
  startDate: string;
  streamEndDate: string;
}

export const FULL_DAO_COMMITMENTS_DATA: FullDAOCommitmentProps[] = [
  {
    recipient: 'Aave Labs',
    discipline: 'Growth',
    token: 'GHO',
    amount: '9M',
    paymentType: 'Streaming Payment',
    dailyStreamRate: '24.7K',
    startDate: 'Jul 1st 2024',
    streamEndDate: 'Jul 1st 2025'
  },
  {
    recipient: 'Aave Finance Steward',
    discipline: 'Buy Back',
    token: 'aEthUSDC',
    amount: '5M',
    paymentType: 'DAO Commitment',
    dailyStreamRate: '102K',
    startDate: 'May 1st 2025',
    streamEndDate: 'Jun 19th 2025'
  },
  {
    recipient: 'Aave Finance Steward',
    discipline: 'Buy Back',
    token: 'aEthUSDT',
    amount: '5M',
    paymentType: 'DAO Commitment',
    dailyStreamRate: '70.4K',
    startDate: 'Apr 9th 2025',
    streamEndDate: 'Jun 19th 2025'
  },
  {
    recipient: 'ALC Phase VI',
    discipline: 'Growth',
    token: 'aEthLidoGHO',
    amount: '3.5M',
    paymentType: 'DAO Commitment',
    dailyStreamRate: '35.5K',
    startDate: 'Apr 21st 2025',
    streamEndDate: 'Jul 21st 2025'
  },
  {
    recipient: 'ALC Phase VII',
    discipline: 'Growth',
    token: 'aEthLidoGHO',
    amount: '3M',
    paymentType: 'Projected Spend',
    dailyStreamRate: '18.2K',
    startDate: 'Apr 9th 2025',
    streamEndDate: 'Sep 21st 2025'
  },
  {
    recipient: 'ALC Phase VIII',
    discipline: 'Growth',
    token: 'aEthLidoGHO',
    amount: '3M',
    paymentType: 'Projected Spend',
    dailyStreamRate: '33.3K',
    startDate: 'Sep 22nd 2025',
    streamEndDate: 'Dec 21st 2025'
  },
  {
    recipient: 'Merit Program Phase VI',
    discipline: 'Growth',
    token: 'aEthLidoGHO',
    amount: '3M',
    paymentType: 'Projected Spend',
    dailyStreamRate: '32.6K',
    startDate: 'May 23rd 2025',
    streamEndDate: 'Aug 23rd 2025'
  },
  {
    recipient: 'Merit Program Phase VII',
    discipline: 'Growth',
    token: 'aEthLidoGHO',
    amount: '3M',
    paymentType: 'Projected Spend',
    dailyStreamRate: '33K',
    startDate: 'Aug 24th 2025',
    streamEndDate: 'Nov 23rd 2025'
  },
  {
    recipient: 'Aave Chan Initiative',
    discipline: 'Growth',
    token: 'aEthLidoGHO',
    amount: '3M',
    paymentType: 'Streaming Payment',
    dailyStreamRate: '8.2K',
    startDate: 'May 3rd 2025',
    streamEndDate: 'May 3rd 2026'
  },
  {
    recipient: 'Bored Ghosts Developing',
    discipline: 'Technical',
    token: 'aEthUSDT',
    amount: '1.2M',
    paymentType: 'DAO Commitment',
    dailyStreamRate: '0',
    startDate: 'May 4th 2025',
    streamEndDate: ''
  }
];
