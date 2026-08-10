import { useState } from 'react';

import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import { Tooltip } from '@/shared/ui/Tooltip/Tooltip';

export type CSVDownloadButtonProps = {
  data: object[] | (() => object[]);
  filename?: string;
  className?: string;
  tooltipContent?: string;
}

export default function CSVDownloadButton(props: CSVDownloadButtonProps) {
  const {
    data,
    tooltipContent,
    filename = 'export.csv',
    className,
  } = props;

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = () => {
    try {
      if (isProcessing) return;

      setIsProcessing(true);
      
      const records = typeof data === 'function' ? data() : data;

      const rawCsv = (() => {
        const uniqueHeaders = new Set<string>();
        
        for (const row of records) {
          for (const header in row) {
            uniqueHeaders.add(header);
          }
        }

        return [
          [...uniqueHeaders],
          ...(
            records.map((o) => {
              const values: string[] = [];

              for (const header of uniqueHeaders) {
                values.push((() => {
                  const value = Reflect.get(o, header);

                  switch (typeof value) {
                    case 'string':
                    case 'bigint':
                    case 'number': {
                      return (`${value}`).replace(/(?:\r\n|\r|\n)/g, ' ').trim();
                    }
                    default: {
                      return '';
                    }
                  }
                })());
              }

              return values;
            })
          ),
        ].join('\n');
      })();
      
      const link = document.createElement('a');

      const blob = new Blob([rawCsv], { type: 'text/csv;charset=utf-8;' });

      const url = URL.createObjectURL(blob);

      link.href = url;
      link.download = filename;
      
      document.body.appendChild(link);
      
      link.click();
      
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isMobile) {
    return (
      <Button
        className={'w-full justify-start'}
        disabled={isProcessing}
        onClick={handleClick}
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
        disabled={isProcessing}
        onClick={handleClick}
      >
        <Icon
          name='download'
          className='h-6 w-6'
        />
      </Button>
    </Tooltip>
  );
}
