import { BarSize, OptionType, TokenData } from '@/shared/types';

interface TotalTreasuryValueProps {
  isLoading?: boolean;
  isError?: boolean;
  data?: TokenData[];
  onCopyLink?: (id: string) => void;
}

interface FiltersProps {
  chainOptions: OptionType[];

  deploymentOptionsFilter: OptionType[];

  assetTypeOptions: OptionType[];

  symbolOptions: OptionType[];

  barSize: BarSize;

  showEvents: boolean;

  isLoading: boolean;

  isOpenSingle: boolean;

  groupBy: string;

  csvFilename: string;

  isShowEyeIcon: boolean;

  isShowCalendarIcon: boolean;

  csvData: Record<string, string | number>[];

  areAllSeriesHidden: boolean;

  selectedOptions: {
    chain: OptionType[];

    assetType: OptionType[];

    deployment: OptionType[];

    symbol: OptionType[];
  };

  onSelectChain: (chain: OptionType[]) => void;

  onSelectAssetType: (assetType: OptionType[]) => void;

  onSelectMarket: (deployment: OptionType[]) => void;

  onSelectSymbol: (symbol: OptionType[]) => void;

  onBarSizeChange: (value: string) => void;

  openSingleDropdown: () => void;

  closeSingle: () => void;

  onClearAll: () => void;

  onSelectAll: () => void;

  onDeselectAll: () => void;

  selectSingle: (value: string) => void;

  selectSingleClose: (value: string) => void;

  onShowEvents: (value: boolean) => void;
}

export type { FiltersProps, TotalTreasuryValueProps };
