import React from 'react';
import { CSVLink } from 'react-csv';

import Icon from '@/shared/ui/Icon/Icon';

interface CSVDownloadButtonProps {
  data: Array<Record<string, string | number | boolean | null | undefined>>;
  filename?: string;
  className?: string;
}

const CSVDownloadButton: React.FC<CSVDownloadButtonProps> = ({
  data,
  filename = 'export.csv',
  className = 'bg-primary-19 text-primary-11 rounded p-1'
}) => {
  return (
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
  );
};

export default CSVDownloadButton;
