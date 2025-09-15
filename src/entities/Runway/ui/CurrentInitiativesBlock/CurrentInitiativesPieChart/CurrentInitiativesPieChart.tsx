import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { cn } from '@/shared/lib/classNames';
import { colorPicker } from '@/shared/lib/utils/utils';
import { Button, Each, Icon, Text, View } from '@/shared/ui/atoms';

interface CurrentInitiativesPieChartDataItem {
  name: string;
  percent: number;
  value: string;
  color?: string;
}

interface CurrentInitiativesPieChartChartProps {
  data: CurrentInitiativesPieChartDataItem[];

  isResponse?: boolean;

  responseOptions?: Highcharts.ResponsiveOptions;

  className?: string;
}

const CurrentInitiativesPieChart: FC<CurrentInitiativesPieChartChartProps> = ({
  data,
  className
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [hc, setHc] = useState<Highcharts.Chart | null>(null);

  const updateArrows = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  const scrollByDir = (dir: 'left' | 'right') => {
    const el = viewportRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.6, 120);
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  const findPointByName = useCallback(
    (name: string) =>
      hc?.series?.[0]?.points.find(
        (p) => p.name === name && p.visible !== false
      ),
    [hc]
  );

  const highlightPoint = useCallback(
    (name: string) => {
      const pt = findPointByName(name);
      if (!pt) return;

      pt.series.points.forEach((p) =>
        p.setState(p === pt ? 'hover' : 'inactive')
      );
      hc?.tooltip?.refresh(pt);
    },
    [hc, findPointByName]
  );

  const clearHighlight = useCallback(() => {
    const s = hc?.series?.[0];
    if (!s) return;
    s.points.forEach((p) => p.setState(''));
    hc?.tooltip?.hide(0);
  }, [hc]);

  useMemo(() => {
    setHiddenItems(new Set());
  }, [data]);

  const chartData = useMemo(() => {
    const visibleItems = data.filter((item) => !hiddenItems.has(item.name));
    const totalVisiblePercent = visibleItems.reduce(
      (sum, item) => sum + item.percent,
      0
    );

    return data.map((el, index) => {
      const isVisible = !hiddenItems.has(el.name);
      const newPercent =
        isVisible && totalVisiblePercent > 0
          ? (el.percent / totalVisiblePercent) * 100
          : 0;

      return {
        name: el.name,
        y: newPercent,
        value: el.value,
        color: el.color || colorPicker(index),
        visible: isVisible
      };
    });
  }, [data, hiddenItems]);

  const areAllSeriesHidden = useMemo(() => {
    if (!data || data.length === 0) {
      return false;
    }
    return hiddenItems.size === data.length;
  }, [data, hiddenItems]);

  const shouldShowNoDataMessage = useMemo(() => {
    if (!data || data.length === 0) {
      return true;
    }

    const visibleItems = data.filter((item) => !hiddenItems.has(item.name));

    return (
      visibleItems.length === 0 ||
      visibleItems.every((item) => item.percent === 0)
    );
  }, [data, hiddenItems]);

  const isLastActiveLegend = useMemo(() => {
    const visibleLegends = chartData.filter((el) => el.visible);

    return visibleLegends.length === 1;
  }, [chartData]);

  const onLegendItemClick = (itemName: string) => {
    if (isLastActiveLegend && !hiddenItems.has(itemName)) return;

    setHiddenItems((prev) => {
      const next = new Set(prev);

      if (next.has(itemName)) {
        next.delete(itemName);
      } else {
        next.add(itemName);
      }

      return next;
    });
  };

  const options: Highcharts.Options = {
    chart: {
      plotBackgroundColor: undefined,
      plotBorderWidth: undefined,
      plotShadow: false,
      type: 'pie'
    },
    credits: {
      enabled: false
    },
    title: {
      text: ''
    },
    tooltip: {
      useHTML: true,
      padding: 16,
      borderRadius: 8,
      backgroundColor: '#FFFFFF',
      shadow: {
        color: '#0000000A',
        offsetX: 6,
        offsetY: 0,
        opacity: 1,
        width: 12
      },
      style: {
        fontFamily: 'Haas Grot Text R, sans-serif',
        fontSize: '11px',
        lineHeight: '16px',
        letterSpacing: '0'
      },
      headerFormat: `
        <div style="
          font-weight: 500;
          margin-bottom: 16px;
          font-family: 'Haas Grot Text R', sans-serif;
        ">
          {point.name}
        </div>
      `,
      pointFormat: `
        <div style="display: flex; gap: 24px; align-items: center; justify-content: space-between; font-family: 'Haas Grot Text R', sans-serif;">
          <div style="font-weight: 400;">
            {point.y:.1f}%
          </div>
          <div style="font-weight: 400;">
            {point.value}
          </div>
        </div>
      `
    },
    plotOptions: {
      series: {
        states: { inactive: { opacity: 0.25 } }
      },
      pie: {
        innerSize: '70%',
        allowPointSelect: false,
        cursor: 'default',
        enableMouseTracking: true,
        borderWidth: 0,
        borderRadius: 0,
        borderColor: undefined,
        states: {
          hover: {
            enabled: true,
            shadow: false,
            halo: {
              size: 0
            }
          }
        },
        dataLabels: {
          enabled: false
        },
        showInLegend: true,
        point: {
          events: {
            legendItemClick: function (this: Highcharts.Point): boolean {
              return false;
            }
          }
        }
      }
    },
    legend: { enabled: false },
    series: [
      {
        type: 'pie',
        borderWidth: 0,
        data: chartData as unknown as Highcharts.PointOptionsObject[]
      }
    ]
  };

  useEffect(() => {
    updateArrows();

    const onResize = () => updateArrows();

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, [chartData.length, updateArrows]);

  return (
    <div className={cn('highcharts-container relative', className)}>
      {areAllSeriesHidden && (
        <Text
          size='11'
          className='text-primary-14 pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2'
        >
          All series are hidden
        </Text>
      )}
      {!areAllSeriesHidden && shouldShowNoDataMessage && (
        <Text
          size='11'
          className='text-primary-14 pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2'
        >
          All visible values are zero
        </Text>
      )}
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        options={options}
        callback={(chart: any) => setHc(chart)}
        containerProps={{
          style: {
            width: '100%',
            maxHeight: '350px'
          }
        }}
      />
      <View.Condition
        if={Boolean(!areAllSeriesHidden && !shouldShowNoDataMessage)}
      >
        <div className='mx-5 md:mx-0'>
          <div
            className={cn(
              'bg-secondary-35 shadow-13 relative mx-auto h-[38px] max-w-fit rounded-lg',
              'before:pointer-events-none before:absolute before:top-[1px] before:left-[1px] before:z-[2] before:h-full before:w-20 before:rounded-[39px] before:opacity-0',
              'after:pointer-events-none after:absolute after:top-[1px] after:right-[1px] after:h-full after:w-20 after:rounded-r-[39px] after:opacity-0',
              {
                'before:max-h-[36px] before:rotate-180 before:bg-[linear-gradient(270deg,#f8f8f8_55.97%,rgba(112,113,129,0)_99.41%)] before:opacity-100 dark:before:bg-[linear-gradient(90deg,rgba(122,138,153,0)_19.83%,#17212b_63.36%)]':
                  canScrollLeft,
                'after:max-h-[36px] after:bg-[linear-gradient(270deg,#f8f8f8_55.97%,rgba(112,113,129,0)_99.41%)] after:opacity-100 dark:after:bg-[linear-gradient(90deg,rgba(122,138,153,0)_19.83%,#17212b_63.36%)]':
                  canScrollRight
              }
            )}
          >
            <View.Condition if={canScrollLeft}>
              <Button
                className={cn(
                  'bg-secondary-36 absolute top-1/2 left-1.5 z-[2] grid h-[26px] w-[26px] -translate-y-1/2 place-items-center rounded-lg'
                )}
                onClick={() => {
                  clearHighlight();
                  scrollByDir('left');
                }}
              >
                <Icon
                  name='arrow-triangle'
                  className='h-[6px] w-[6px]'
                />
              </Button>
            </View.Condition>
            <div
              ref={viewportRef}
              onScroll={() => {
                updateArrows();
                clearHighlight();
              }}
              className={cn(
                'hide-scrollbar mx-0.5 flex h-full max-w-[99%] items-center gap-4 overflow-x-auto scroll-smooth p-1.5'
              )}
            >
              <Each
                data={chartData}
                render={(item) => (
                  <Button
                    key={item.name}
                    className={cn(
                      'text-primary-14 flex shrink-0 gap-1.5 text-[11px] leading-none font-normal',
                      {
                        'line-through opacity-30': hiddenItems.has(item.name),
                        'cursor-not-allowed':
                          isLastActiveLegend && !hiddenItems.has(item.name)
                      }
                    )}
                    onMouseEnter={() => highlightPoint(item.name)}
                    onFocus={() => highlightPoint(item.name)}
                    onMouseLeave={clearHighlight}
                    onBlur={clearHighlight}
                    onClick={() => onLegendItemClick(item.name)}
                  >
                    <span
                      className='inline-block h-3 w-3 rounded-full'
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </Button>
                )}
              />
            </div>
            <View.Condition if={canScrollRight}>
              <Button
                className={cn(
                  'bg-secondary-36 absolute top-1/2 right-1.5 z-[2] grid h-[26px] w-[26px] -translate-y-1/2 place-items-center rounded-lg'
                )}
                onClick={() => {
                  clearHighlight();
                  scrollByDir('right');
                }}
              >
                <Icon
                  name='arrow-triangle'
                  className='h-[6px] w-[6px] rotate-180'
                />
              </Button>
            </View.Condition>
          </div>
        </div>
      </View.Condition>
    </div>
  );
};

export { CurrentInitiativesPieChart };
