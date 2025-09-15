interface AnnualisedExpensesRow {
  discipline: string;
  token: string;
  amount: number;
  value: number;
}

interface AnnualisedExpensesFooter {
  amount: number;
  value: number;
}

interface AnnualisedExpensesComponentProps {
  data: AnnualisedExpensesRow[];

  footerData: AnnualisedExpensesFooter;

  sortType: { key: string; type: string };
}

export type {
  AnnualisedExpensesComponentProps,
  AnnualisedExpensesFooter,
  AnnualisedExpensesRow
};
