export interface TableItem {
  network: string;
  collateral: string;
  collateralPrice: string;
  priceRestriction: string;
  priceFeed: string;
  oracleName: string;
}

export interface Source {
  id: number;
  address: string;
  network: string;
  type: string;
  market: string | null;
  assetId: number;
}

export interface Asset {
  id: number;
  address: string;
  decimals: number;
  symbol: string;
  network: string;
  type: string;
}

export interface CapoItem {
  oracleAddress: string;
  oracleName: string;
  dateOfAggregation: number;
  capValue: string;
  assetId: number;
  price: string;
}
