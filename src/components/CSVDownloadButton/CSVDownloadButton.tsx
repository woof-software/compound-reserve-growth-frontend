import React, { FC } from 'react';
import { CSVLink } from 'react-csv';

import { Tooltip } from '@/components/Tooltip/Tooltip';
import Icon from '@/shared/ui/Icon/Icon';

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
  className = 'bg-primary-20 flex items-center justify-center p-1 rounded-lg w-8 h-8 shadow-16 dark:shadow-13 hover:opacity-80 transition-opacity duration-200'
}) => {
  return (
    <Tooltip
      content={tooltipContent || 'Current data can be downloaded in CSV'}
    >
      <span
        className={className}
        role='button'
        tabIndex={0}
        style={{ display: 'inline-flex' }}
      >
        <CSVLink
          data={data}
          filename={filename}
          className={className}
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
