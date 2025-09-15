interface FullDAOCommitmentRow {
  recipient: string;
  discipline: string;
  token: string;
  amount: number;
  paymentType: string;
  proposalLink: string;
  dailyStreamRate: number;
  startDate: string;
  streamEndDate: string;
  status: string;
  paidAmount: number;
  percentagePaid: number;
}

interface FullDAOCommitmentsProps {
  data: FullDAOCommitmentRow[];

  sortType: { key: string; type: string };
}

export type { FullDAOCommitmentRow, FullDAOCommitmentsProps };
