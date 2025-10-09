interface TableData {
  network: string;
  valueComp: number;
  valueUsd: number;
}

export const getCsvData = (tableData: TableData[]) => {
  return tableData.map((item) => ({
    network: item.network,
    valueComp: item.valueComp,
    valueUsd: item.valueUsd
  }));
};
