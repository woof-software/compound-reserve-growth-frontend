import * as React from 'react';
import { useMemo, useState } from 'react';

import LineChart from '@/components/Charts/Line/Line';
import Filter, { SelectedFiltersType } from '@/components/Filter/Filter';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

const TEST_FILTERS_LIST = [
  {
    id: 'chain',
    title: 'Chain',
    placeholder: 'Add Chain',
    options: [
      'Ethereum',
      'Arbitrum',
      'Avalanche',
      'Optimism',
      'Polygon',
      'Base',
      'Sonic'
    ]
  },
  {
    id: 'assetType',
    title: 'Asset Type',
    placeholder: 'Add Asset Type',
    options: ['DeFi', 'Stablecoin', 'BTC Corellated', 'ETH Corellated', 'COMP']
  },
  {
    id: 'deployment',
    title: 'Deployment',
    placeholder: 'Add Deployment',
    options: [
      'Arbitrum V3',
      'Arbitrum V2',
      'Avalanche V3',
      'Base V3',
      'Ethereum Lido',
      'Ethereum V3'
    ]
  }
];

type FilterItem = {
  id: string;

  title: string;

  placeholder: string;

  options: string[];
};

const TotalTresuaryValue = () => {
  const seriesData = [
    ...Array.from({ length: 100 }, (_, i) => ({
      x: Date.UTC(2000 + i, 0, 1),
      y: Math.round(Math.random() * 100)
    }))
  ];

  const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersType[]>(
    []
  );

  const [localSelectedFilters, setLocalSelectedFilters] = useState<
    SelectedFiltersType[]
  >([]);

  const filtersList: FilterItem[] = useMemo(() => {
    return TEST_FILTERS_LIST;
  }, []);

  const onFilterItemSelect = (filterId: string, item: string) => {
    const filterItem = localSelectedFilters.find(
      (filter) => filter.id === filterId
    );

    if (filterItem) {
      const updatedSelectedItems = filterItem.selectedItems.includes(item)
        ? filterItem.selectedItems.filter((i) => i !== item)
        : [...filterItem.selectedItems, item];

      const updatedFiltersList = localSelectedFilters.map((filter) =>
        filter.id === filterId
          ? { ...filter, selectedItems: updatedSelectedItems }
          : filter
      );

      setLocalSelectedFilters(updatedFiltersList);

      return;
    }

    const newFilterItem: SelectedFiltersType = {
      id: filterId,
      selectedItems: [item]
    };

    setLocalSelectedFilters((prev) => [...prev, newFilterItem]);
  };

  const onClear = () => {
    setLocalSelectedFilters([]);

    setSelectedFilters([]);
  };

  const onApply = () => {
    setSelectedFilters(localSelectedFilters);
  };

  const onOutsideClick = () => {
    setLocalSelectedFilters(selectedFilters);
  };

  return (
    <Card
      title='Total Treasury Value'
      contentClassName='pt-0 pb-10 px-10 flex flex-col gap-3'
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
        <TabsGroup
          tabs={['7D', '30D', '90D', '1Y']}
          defaultTab='7D'
        />

        <TabsGroup
          tabs={['H', 'D', 'W']}
          defaultTab='D'
        />

        <Filter
          activeFilters={Number(selectedFilters.length)}
          selectedItems={localSelectedFilters}
          filtersList={filtersList}
          onApply={onApply}
          onClear={onClear}
          onFilterItemSelect={onFilterItemSelect}
          onOutsideClick={onOutsideClick}
        />
      </div>

      <LineChart
        data={seriesData}
        className='max-h-[400px]'
      />
    </Card>
  );
};

export default TotalTresuaryValue;
