import React, { FC, useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { getBarChartOptions } from '@/components/Charts/Bar/barChartOptions';
import Button from '@/shared/ui/Button/Button';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface CryptoChartProps {
  data: ChartData[];
  onClear: () => void;
  customOptions?: Highcharts.Options;
}

const BarChart: FC<CryptoChartProps> = ({ data, onClear, customOptions }) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;
  }, [data]);

  return (
    <>
      <View.Condition if={Boolean(data.length > 0)}>
        <HighchartsReact
          ref={chartRef}
          highcharts={Highcharts}
          options={getBarChartOptions({ data, customOptions })}
        />
      </View.Condition>
      <View.Condition if={Boolean(data.length <= 0)}>
        <div className='flex min-w-auto flex-col items-center justify-center gap-3.5 sm:min-w-[400px]'>
          <Text
            size='11'
            weight='500'
            className='text-secondary-32'
          >
            Select more options in order to see the Graph comparison
          </Text>
          <Button
            className='bg-aqua-green h-[36px] w-[108px] rounded-lg text-[11px] font-semibold'
            onClick={onClear}
          >
            Reset Filters
          </Button>
        </div>
      </View.Condition>
    </>
  );
};

export default BarChart;
