// RevenueOverviewUSD
export interface RevenueOverviewUSDProps {
  chain: string;
  rolling7D: string;
  rolling30D: string;
  rolling90D: string;
  rolling180D: string;
  rolling365D: string;
}

export const REVENUE_OVERVIEW_USD: RevenueOverviewUSDProps[] = [
  {
    chain: 'Ethereum',
    rolling7D: '1,518,267',
    rolling30D: '5,932,649',
    rolling90D: '15,757,451',
    rolling180D: '48,164,578',
    rolling365D: '91,300,281'
  },
  {
    chain: 'Avalanche',
    rolling7D: '52,998',
    rolling30D: '225,150',
    rolling90D: '583,702',
    rolling180D: '1,294,911',
    rolling365D: '2,499,270'
  },
  {
    chain: 'Arbitrum',
    rolling7D: '38,351',
    rolling30D: '203,703',
    rolling90D: '637,211',
    rolling180D: '2,192,672',
    rolling365D: '4,606,107'
  },
  {
    chain: 'Polygon',
    rolling7D: '31,904',
    rolling30D: '162,387',
    rolling90D: '595,313',
    rolling180D: '3,057,793',
    rolling365D: '5,689,694'
  },
  {
    chain: 'Base',
    rolling7D: '30,147',
    rolling30D: '132,177',
    rolling90D: '346,320',
    rolling180D: '969,092',
    rolling365D: '1,377,763'
  },
  {
    chain: 'Optimism',
    rolling7D: '5,131',
    rolling30D: '26,948',
    rolling90D: '102,805',
    rolling180D: '409,693',
    rolling365D: '947,979'
  },
  {
    chain: 'Sonic',
    rolling7D: '3,562',
    rolling30D: '21,351',
    rolling90D: '67,592',
    rolling180D: '67,592',
    rolling365D: '67,592'
  }
];

// CompoundFeeRevenuebyChain
export interface CompoundFeeRevenueProps {
  chain: string;
  q3_2024: string;
  q4_2024: string;
  q1_2025: string;
  q2_2025: string;
}

export const COMPOUND_FEE_REVENUE_DATA: CompoundFeeRevenueProps[] = [
  {
    chain: 'Ethereum',
    q3_2024: '16,117,595',
    q4_2024: '30,167,586',
    q1_2025: '26,825,505',
    q2_2025: '11,951,546'
  },
  {
    chain: 'Arbitrum',
    q3_2024: '1,038,649',
    q4_2024: '1,417,125',
    q1_2025: '1,293,841',
    q2_2025: '474,825'
  },
  {
    chain: 'Polygon',
    q3_2024: '1,195,067',
    q4_2024: '1,628,884',
    q1_2025: '1,989,902',
    q2_2025: '402,534'
  },
  {
    chain: 'Avalanche',
    q3_2024: '493,798',
    q4_2024: '756,245',
    q1_2025: '620,942',
    q2_2025: '485,248'
  },
  {
    chain: 'Optimism',
    q3_2024: '229,911',
    q4_2024: '318,562',
    q1_2025: '256,097',
    q2_2025: '70,851'
  },
  {
    chain: 'Base',
    q3_2024: '161,292',
    q4_2024: '374,033',
    q1_2025: '545,056',
    q2_2025: '275,865'
  },
  {
    chain: 'Sonic',
    q3_2024: '-',
    q4_2024: '-',
    q1_2025: '9,869',
    q2_2025: '57,723'
  }
];

// CompoundFeeRevenuebyChain
export interface RevenueBreakdownProps {
  chain: string;
  instance: string;
  feeType: string;
  reserveAsset: string;
  q3_2024: string;
  q4_2024: string;
  q1_2025: string;
  q2_2025: string;
}

export const REVENUE_BREAKDOWN_DATA: RevenueBreakdownProps[] = [
  {
    chain: 'Total Revenue',
    instance: '',
    feeType: '',
    reserveAsset: '',
    q3_2024: '19,301,192',
    q4_2024: '34,663,183',
    q1_2025: '31,589,316',
    q2_2025: '11,813,640'
  },
  {
    chain: 'Ethereum',
    instance: 'Ethereum',
    feeType: 'Borrow',
    reserveAsset: '19,301,192',
    q3_2024: '16,182,556',
    q4_2024: '30,168,472',
    q1_2025: '26,874,241',
    q2_2025: '10,270,630'
  },
  {
    chain: 'Polygon',
    instance: 'Polygon',
    feeType: 'Borrow',
    reserveAsset: '19,301,192',
    q3_2024: '1,194,992',
    q4_2024: '1,628,810',
    q1_2025: '1,989,430',
    q2_2025: '357,737'
  },
  {
    chain: 'Arbitrum',
    instance: 'Arbitrum',
    feeType: 'Borrow',
    reserveAsset: '19,301,192',
    q3_2024: '1,038,641',
    q4_2024: '1,417,060',
    q1_2025: '1,293,841',
    q2_2025: '420,666'
  },
  {
    chain: 'Avalanche',
    instance: 'Avalanche',
    feeType: 'Borrow',
    reserveAsset: '19,301,192',
    q3_2024: '493,800',
    q4_2024: '756,252',
    q1_2025: '620,945',
    q2_2025: '414,911'
  },
  {
    chain: 'Base',
    instance: 'Base',
    feeType: 'Borrow',
    reserveAsset: '19,301,192',
    q3_2024: '161,292',
    q4_2024: '374,033',
    q1_2025: '545,055',
    q2_2025: '234,248'
  },
  {
    chain: 'Optimism',
    instance: 'Optimism',
    feeType: 'Borrow',
    reserveAsset: '19,301,192',
    q3_2024: '229,911',
    q4_2024: '318,556',
    q1_2025: '255,936',
    q2_2025: '62,579'
  },
  {
    chain: 'Sonic',
    instance: '',
    feeType: '',
    reserveAsset: '',
    q3_2024: '-',
    q4_2024: '-',
    q1_2025: '9,869',
    q2_2025: '52,835'
  }
];
