import { ChangeEvent, MouseEvent as ReactMouseEvent } from 'react';

export const preventEventBubbling = (
  e: ReactMouseEvent<HTMLElement> | ChangeEvent<HTMLInputElement>
): void => {
  e.preventDefault();
  e.stopPropagation();
};

export const colorPicker = (index: number): string => {
  const colors = [
    '#6F42EB',
    '#3877FF',
    '#00D395',
    '#F54E59',
    '#FFA374',
    '#F9FF8E',
    '#8FE6FE',
    '#B39AFF',
    '#FDB0C0',
    '#BCE954',
    '#10A674',
    '#5C8BC4',
    '#F6C642',
    '#02CCFE',
    '#BC8F6F',
    '#7A89B8',
    '#FF752E',
    '#FAB3FF',
    '#58F0C5',
    '#62B1FF'
  ];

  return colors[index];
};

export const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return `${value.toLocaleString()}`;
};

export const formatGrowth = (growth: number) => {
  if (growth === 0) return '-';
  return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
};
