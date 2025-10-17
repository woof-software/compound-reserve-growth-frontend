export interface CapoTableItem {
  network: string;
  collateral: string;
  collateralPrice: string;
  priceRestriction: string;
  priceBuffer: number;
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

export interface CapoNormalizedChartData {
  assetId: number;
  network: string;
  collateral: string;
  price: string;
  capValue: string;
  dateOfAggregation: number;
}

export type Option = {
  id: string;
  label: string;
};

export type OptionSetter = (previous: Option | null) => Option | null;
