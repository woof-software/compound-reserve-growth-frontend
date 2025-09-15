interface CurrentServiceProviderRow {
  provider: string;
  iconKey: string;
  discipline: string;
  token: string;
  amount: number;
  value: number;
}

interface CurrentServiceProviderFooter {
  amount: number;
  value: number;
}

interface CurrentServiceProvidersTableProps {
  data: CurrentServiceProviderRow[];

  footerData: CurrentServiceProviderFooter;

  sortType: { key: string; type: string };
}

export type {
  CurrentServiceProviderFooter,
  CurrentServiceProviderRow,
  CurrentServiceProvidersTableProps
};
