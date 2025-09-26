import React from 'react';

import { OptionType } from '@/shared/types/types';
import { MultiSelect } from '@/shared/ui/AnimationProvider/MultiSelect/MultiSelect';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';

interface DesktopFiltersProps {
  chainOptions: OptionType[];
  collateralOptions: OptionType[];
  selectedChain: OptionType[];
  selectedCollateral: OptionType[];
  onSelectChain: (chain: OptionType[]) => void;
  onSelectCollateral: (deployment: OptionType[]) => void;
  csvData: any[];
  isLoading?: boolean;
}

export const DesktopFilters = ({
  chainOptions,
  selectedChain,
  collateralOptions,
  selectedCollateral,
  onSelectChain,
  onSelectCollateral,
  csvData,
  isLoading = false
}: DesktopFiltersProps) => (
  <div className='hidden items-center justify-end gap-2 px-10 py-3 lg:flex lg:px-0'>
    <MultiSelect
      options={chainOptions}
      value={selectedChain}
      onChange={onSelectChain}
      placeholder='Chain'
      disabled={isLoading}
    />
    <MultiSelect
      options={collateralOptions}
      value={selectedCollateral}
      onChange={onSelectCollateral}
      placeholder='Collateral'
      disabled={isLoading}
    />
    <CSVDownloadButton
      data={csvData}
      filename='Collaterals Price against Price Restriction'
    />
  </div>
);
