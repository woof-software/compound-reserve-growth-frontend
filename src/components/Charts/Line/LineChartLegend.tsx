import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import { Legend } from '@/shared/hooks/useLegends';
import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Each from '@/shared/ui/Each/Each';
import Icon from '@/shared/ui/Icon/Icon';
import View from '@/shared/ui/View/View';

interface LineChartLegendProps {
  legends: Legend[];
  isLastActiveLegend: boolean;
  onLegendHover: (id: string) => void;
  onLegendLeave: (id?: string) => void;
  onLegendClick: (id: string) => void;
}

const LineChartLegend: FC<LineChartLegendProps> = ({
  legends,
  isLastActiveLegend,
  onLegendHover,
  onLegendLeave,
  onLegendClick
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [legends.length, updateArrows]);

  return (
    <>
      <div className='mx-5 block md:mx-0 lg:hidden'>
        <div
          className={cn(
            'bg-secondary-35 shadow-13 relative mx-auto h-[38px] max-w-fit overflow-hidden rounded-lg',
            'before:pointer-events-none before:absolute before:top-[1px] before:left-[1px] before:z-[2] before:h-full before:w-20 before:rounded-sm before:opacity-0',
            'after:pointer-events-none after:absolute after:top-[1px] after:right-[1px] after:h-full after:w-20 after:rounded-r-sm after:opacity-0',
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
              className='bg-secondary-36 absolute top-1/2 left-1.5 z-[2] grid h-[26px] w-[26px] -translate-y-1/2 place-items-center rounded-sm'
              onClick={() => {
                onLegendLeave();
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
              onLegendLeave();
            }}
            className='hide-scrollbar mx-0.5 flex h-full max-w-[99%] items-center gap-4 overflow-x-auto scroll-smooth rounded-lg p-1.5'
          >
            <Each
              data={legends}
              render={({ id, name, color, isDisabled }) => (
                <Button
                  key={id}
                  className={cn(
                    'text-primary-14 flex shrink-0 gap-1.5 text-[11px] leading-none font-normal',
                    {
                      'line-through opacity-30': isDisabled,
                      'cursor-not-allowed': isLastActiveLegend && !isDisabled
                    }
                  )}
                  onMouseEnter={() => onLegendHover(id)}
                  onMouseLeave={() => onLegendLeave(id)}
                  onClick={() => onLegendClick(id)}
                >
                  <span
                    className='inline-block h-3 w-3 rounded-full'
                    style={{ backgroundColor: color }}
                  />
                  {name}
                </Button>
              )}
            />
          </div>
          <View.Condition if={canScrollRight}>
            <Button
              className='bg-secondary-36 absolute top-1/2 right-1.5 z-[2] grid h-[26px] w-[26px] -translate-y-1/2 place-items-center rounded-sm'
              onClick={() => {
                onLegendLeave();
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
      <View.Condition if={legends.length > 1}>
        <div className='mx-auto hidden max-w-[902px] flex-wrap justify-center gap-5 px-[15px] py-2 lg:flex'>
          <Each
            data={legends}
            render={({ id, name, color, isDisabled }) => (
              <Button
                key={id}
                className={cn(
                  'text-primary-14 flex shrink-0 gap-1.5 text-[11px] leading-none font-normal',
                  {
                    'line-through opacity-30': isDisabled,
                    'cursor-not-allowed': isLastActiveLegend && !isDisabled
                  }
                )}
                onMouseEnter={() => onLegendHover(id)}
                onMouseLeave={() => onLegendLeave(id)}
                onClick={() => onLegendClick(id)}
              >
                <span
                  className='inline-block h-3 w-3 rounded-full'
                  style={{ backgroundColor: color }}
                />
                {name}
              </Button>
            )}
          />
        </div>
      </View.Condition>
    </>
  );
};

export default LineChartLegend;
