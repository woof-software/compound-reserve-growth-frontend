import React, { FC } from 'react';
import { CSVLink } from 'react-csv';

import { cn } from '@/shared/lib/classNames/classNames';
import Icon from '@/shared/ui/Icon/Icon';
import { Tooltip } from '@/shared/ui/Tooltip/Tooltip';

interface CSVDownloadButtonProps {
  data: Array<Record<string, string | number | boolean | null | undefined>>;
  filename?: string;
  className?: string;
  tooltipContent?: string;
}

const CSVDownloadButton: FC<CSVDownloadButtonProps> = ({
  data,
  tooltipContent,
  filename = 'export.csv',
  className
}) => {
  return (
    <Tooltip
      content={tooltipContent || 'Current data can be downloaded in CSV'}
    >
      <span
        className={cn(
          'bg-primary-20 shadow-16 dark:shadow-13 flex h-8 w-8 items-center justify-center rounded-lg p-1 transition-opacity duration-200 hover:opacity-80',
          className
        )}
        role='button'
        tabIndex={0}
        style={{ display: 'inline-flex' }}
      >
        <CSVLink
          data={data}
          filename={filename}
        >
          <Icon
            name='download'
            className='h-6 w-6'
          />
        </CSVLink>
      </span>
    </Tooltip>
  );
};

export default CSVDownloadButton;
