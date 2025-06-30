export type FilterItem = {
  id: string;

  title: string;

  placeholder: string;

  options: string[];
};

export type TimeRange = '7B' | '30B' | '90B' | '180B';
export type BarSize = 'D' | 'W' | 'M';

export type OptionType = { id: string; label: string };
