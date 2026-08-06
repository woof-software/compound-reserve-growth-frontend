import { useCallback, useState } from 'react';

import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import { Tooltip } from '@/shared/ui/Tooltip/Tooltip';

type CSVRow = Record<string, string | number | null | undefined>;
type CSVData = CSVRow[] | (() => CSVRow[]) | (() => Promise<CSVRow[]>);

interface CSVDownloadButtonProps {
  data: CSVData;
  filename?: string;
  className?: string;
  tooltipContent?: string;
}

const CSVDownloadButton = (props: CSVDownloadButtonProps) => {
  const { data, tooltipContent, filename = 'export.csv', className } = props;

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = typeof data === 'function' ? await data() : data;

      const escapeCell = (value: string | number | null | undefined): string => {
        const str = value == null ? '' : String(value);
        return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
      };

      const csv = rows.length
        ? (() => {
          const headers = Object.keys(rows[0]);
          const lines = [headers, ...rows.map((row) => headers.map((key) => row[key]))];
          return lines.map((line) => line.map(escapeCell).join(',')).join('\n');
        })()
        : '';

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsLoading(false);
    }
  }, [data, filename]);

  if (isMobile) {
    return (
      <Button
        className={'w-full justify-start'}
        onClick={handleClick}
        disabled={isLoading}
      >
        <Icon
          name='download'
          className='h-6 w-6'
        />
        <Text size='14' weight='500'>
          CSV with the entire historical data
        </Text>
      </Button>
    );
  }

  return (
    <Tooltip
      content={tooltipContent || 'Current data can be downloaded in CSV'}
    >
      <Button
        className={cn(
          'bg-primary-20 shadow-16 dark:shadow-13 flex h-8 w-8 items-center justify-center rounded-lg p-1 transition-opacity duration-200 hover:opacity-80',
          className
        )}
        disabled={isLoading}
        onClick={handleClick}
      >
        <Icon
          name='download'
          className='h-6 w-6'
        />
      </Button>
    </Tooltip>
  );
};

export default CSVDownloadButton;