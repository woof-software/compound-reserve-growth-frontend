import { useMemo, useState } from 'react';

interface PaginationProps<T> {
  tableData: T[];

  pageSize?: number;
}

const usePagination = <T>({ tableData, pageSize = 10 }: PaginationProps<T>) => {
  const maxPages = Math.ceil(tableData.length / pageSize);

  const [pageIndex, setPageIndex] = useState<number>(0);

  const dataRows = useMemo(
    () =>
      tableData.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize),
    [tableData, pageIndex, pageSize]
  );

  const goFirst = () => setPageIndex(0);
  const goPrev = () => setPageIndex((p) => Math.max(p - 1, 0));
  const goNext = () => setPageIndex((p) => Math.min(p + 1, maxPages - 1));
  const goLast = () => setPageIndex(maxPages - 1);

  return {
    dataRows,
    pageIndex,
    maxPages,
    goFirst,
    goPrev,
    goNext,
    goLast
  };
};

export { usePagination };
