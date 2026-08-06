import { ComponentProps, ReactNode,useState } from 'react';
import { CSVLink } from 'react-csv';

import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import { Tooltip } from '@/shared/ui/Tooltip/Tooltip';

type CSVRow = Record<string, string | number | null | undefined>;

interface CSVDownloadButtonProps {
  data: string | CSVRow[] | (() => string) | (() => CSVRow[]);
  filename?: string;
  className?: string;
  tooltipContent?: string;
  renderAsLink?: boolean;
  children?: ReactNode;
}

const CSVDownloadButton = (props: CSVDownloadButtonProps) => {
  const {
    data,
    tooltipContent,
    filename = 'export.csv',
    className,
  } = props;

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  const [resolvedData, setResolvedData] = useState<string | CSVRow[]>(
    typeof data === 'function' ? [] : data
  );

  const handleClick: ComponentProps<typeof CSVLink>['onClick'] = (_event, done) => {
    if (typeof data === 'function') {
      setResolvedData(data());
    } else {
      setResolvedData(data);
    }

    done(true);
  };

  if (isMobile) {
    return (
      <Button className={'w-full'}>
        <CSVLink
          data={resolvedData}
          filename={filename}
          asyncOnClick
          onClick={handleClick}
          className={'flex items-center gap-1.5 h-11 w-full'}
        >
          <Icon
            name='download'
            className='h-6 w-6'
          />
          <Text size='14' weight='500'>
            CSV with the entire historical data
          </Text>
        </CSVLink>
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
      >
        <CSVLink
          data={resolvedData}
          filename={filename}
          asyncOnClick
          onClick={handleClick}
        >
          <Icon
            name='download'
            className='h-6 w-6'
          />
        </CSVLink>
      </Button>
    </Tooltip>
  );
};

export default CSVDownloadButton;