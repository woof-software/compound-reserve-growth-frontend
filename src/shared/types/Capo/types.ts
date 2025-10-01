export interface TableItem {
  network: string;
  collateral: string;
  collateralPrice: string;
  priceRestriction: string;
  priceFeed: string;
  oracleName: string;
}

export interface CapoItem {
  oracleAddress: string;
  oracleName: string;
  dateOfAggregation: number;
  capValue: string;
  assetId: number;
  price: string;
}

export interface NormalizedChartData {
  assetId: number;
  network: string;
  collateral: string;
  price: string;
  capValue: string;
  dateOfAggregation: number;
}
