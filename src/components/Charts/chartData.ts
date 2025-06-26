export interface StackedChartData {
  period?: string;
  date?: string;
  ethereum?: number;
  arbitrum?: number;
  avalanche?: number;
  base?: number;
  optimism?: number;
  polygon?: number;
  sonic?: number;
  [key: string]: string | number | undefined;
}

export const seriesConfig = [
  { key: 'ethereum', name: 'Ethereum', color: '#3B82F6' },
  { key: 'arbitrum', name: 'Arbitrum', color: '#10B981' },
  { key: 'avalanche', name: 'Avalanche', color: '#F59E0B' },
  { key: 'base', name: 'Base', color: '#EF4444' },
  { key: 'optimism', name: 'Optimism', color: '#8B5CF6' },
  { key: 'polygon', name: 'Polygon', color: '#F97316' },
  { key: 'sonic', name: 'Sonic', color: '#EC4899' }
];

const generateDailyMockData = (days: number): StackedChartData[] => {
  const data: StackedChartData[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const currentValues: { [key: string]: number } = {
    ethereum: 100000,
    arbitrum: 5000,
    avalanche: 10000,
    base: 2000,
    optimism: 8000,
    polygon: 15000,
    sonic: 1000
  };

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const dataPoint: StackedChartData = {
      date: currentDate.toISOString().split('T')[0],
      ethereum: Math.max(0, Math.round(currentValues.ethereum)),
      arbitrum: Math.max(0, Math.round(currentValues.arbitrum)),
      avalanche: Math.max(0, Math.round(currentValues.avalanche)),
      base: Math.max(0, Math.round(currentValues.base)),
      optimism: Math.max(0, Math.round(currentValues.optimism)),
      polygon: Math.max(0, Math.round(currentValues.polygon)),
      sonic: Math.max(0, Math.round(currentValues.sonic))
    };
    data.push(dataPoint);

    Object.keys(currentValues).forEach((key) => {
      currentValues[key] *= 1.001 + (Math.random() - 0.5) * 0.05;
    });
  }

  return data;
};

export const stackedChartData: StackedChartData[] = generateDailyMockData(1825);

// MultiSelect in RevenuePage
export const blockchains = [
  { id: 'arbitrum', label: 'Arbitrum' },
  { id: 'avalanche', label: 'Avalanche' },
  { id: 'base', label: 'Base' },
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'optimism', label: 'Optimism' },
  { id: 'polygon', label: 'Polygon' }
];
