import {
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef
} from 'react';

import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';
import { getTotalMetricValues } from '@/entities/Insentive/MetricBlock/lib/utils';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { useModal } from '@/shared/hooks/useModal';
import { Format } from '@/shared/lib/utils/numbersFormatter';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';
import Card from '@/shared/ui/Card/Card';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import { Tooltip } from '@/shared/ui/Tooltip/Tooltip';

interface MetricBlockProps {
  data: CombinedIncentivesData[];
  isLoading: boolean;
  activeTab: string;
}

const TooltipIncentive = ({
  children,
  activeTab,
  autoHideMs = 2000,
  classNameMobile = 'block lg:hidden',
  classNameDesktop = 'hidden lg:block'
}: {
  children: ReactNode;
  activeTab: string;
  autoHideMs?: number;
  classNameMobile?: string;
  classNameDesktop?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const { isOpen, onOpenModal, onCloseModal } = useModal();

  const infoContent = useMemo(
    () => (
      <div>
        <Text
          weight='500'
          size='11'
          lineHeight='16'
          className='text-primary-14'
        >
          Data for the recent {activeTab === 'Day' ? '24 hours' : '365 days'}.
        </Text>
        <Text
          weight='500'
          size='11'
          lineHeight='16'
          className='text-primary-14'
        >
          Updates daily at 12:05 PM UTC.
        </Text>
      </div>
    ),
    [activeTab]
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onMobileToggle = useCallback(() => {
    if (isOpen) {
      clearTimer();
      onCloseModal();
      return;
    }

    onOpenModal();

    clearTimer();
    timerRef.current = window.setTimeout(() => {
      onCloseModal();
      timerRef.current = null;
    }, autoHideMs);
  }, [autoHideMs, clearTimer, isOpen, onCloseModal, onOpenModal]);

  useClickOutside(containerRef as RefObject<HTMLDivElement>, () => {
    if (isOpen) {
      clearTimer();
      onCloseModal();
    }
  });

  useEffect(() => clearTimer, [clearTimer]);

  return (
    <>
      <div className={classNameMobile}>
        <Tooltip
          open={isOpen}
          content={infoContent}
        >
          <div
            ref={containerRef}
            onClick={onMobileToggle}
            role='button'
            tabIndex={0}
          >
            {children}
          </div>
        </Tooltip>
      </div>
      <div className={classNameDesktop}>
        <Tooltip content={infoContent}>{children}</Tooltip>
      </div>
    </>
  );
};

const MetricBlock = (props: MetricBlockProps) => {
  const { data, isLoading, activeTab } = props;

  const { theme } = useTheme();

  const metrics = getTotalMetricValues(data, activeTab);

  const activeTimeTab = activeTab === 'Day' ? '24h' : '365d';

  return (
    <div className='flex flex-col gap-2.5 lg:gap-5'>
      <div className='flex flex-col gap-2.5 md:flex-row lg:gap-5'>
        <Card
          title={`${activeTimeTab} Lend incentives`}
          isLoading={isLoading}
          className={{
            container: 'max-w-full min-w-64',
            loading: 'h-[200px]',
            header: 'px-5 py-4',
            content:
              'relative flex items-center overflow-clip bg-[linear-gradient(270deg,#B9E6D9_2.63%,#FFFFFF_100%)] px-5 py-10 md:p-10 dark:bg-[linear-gradient(270deg,#154F48_2.63%,#1D2833_100%)]'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <Icon
                name='comp-metric'
                className='h-8 w-8'
              />
              <TooltipIncentive activeTab={activeTab}>
                <Text
                  weight='700'
                  size='32'
                  className='cursor-pointer'
                >
                  {Format.token(metrics.totalLendIncentives, 'standard')}
                </Text>
              </TooltipIncentive>
            </div>
            <Text
              weight='500'
              size='13'
              className='text-primary-14'
            >
              {Format.price(metrics.totalLendIncentivesUsdPrice, 'standard')}
            </Text>
          </div>
          <Icon
            name={
              theme === 'dark' ? 'compound-metric-logo' : 'comp-metric-light'
            }
            className='absolute top-[-25px] right-5 z-[1] h-[190px] w-[180px]'
          />
        </Card>
        <Card
          title={`${activeTimeTab} Borrow incentives`}
          isLoading={isLoading}
          className={{
            container: 'max-w-full min-w-64',
            loading: 'h-[200px]',
            header: 'px-5 py-4',
            content:
              'relative flex items-center overflow-clip bg-[linear-gradient(270deg,#B9E6D9_2.63%,#FFFFFF_100%)] px-5 py-10 md:p-10 dark:bg-[linear-gradient(270deg,#154F48_2.63%,#1D2833_100%)]'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <Icon
                name='comp-metric'
                className='h-8 w-8'
              />
              <TooltipIncentive activeTab={activeTab}>
                <Text
                  weight='700'
                  size='32'
                  className='cursor-pointer'
                >
                  {Format.token(metrics.totalBorrowIncentives, 'standard')}
                </Text>
              </TooltipIncentive>
            </div>
            <Text
              weight='500'
              size='13'
              className='text-primary-14'
            >
              {Format.price(metrics.totalBorrowIncentivesUsdPrice, 'standard')}
            </Text>
          </div>
          <Icon
            name={
              theme === 'dark' ? 'compound-metric-logo' : 'comp-metric-light'
            }
            className='absolute top-[-25px] right-[5px] z-[1] h-[190px] w-[180px] lg:right-5'
          />
        </Card>
      </div>
      <div className='flex flex-col gap-2.5 md:flex-row lg:gap-5'>
        <Card
          title={`${activeTimeTab} Total incentives`}
          isLoading={isLoading}
          className={{
            container: 'max-w-full min-w-64',
            loading: 'h-[200px]',
            header: 'px-5 py-4',
            content:
              'relative flex items-center overflow-clip bg-[linear-gradient(270deg,#B9E6D9_2.63%,#FFFFFF_100%)] px-5 py-10 md:p-10 dark:bg-[linear-gradient(270deg,#154F48_2.63%,#1D2833_100%)]'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <Icon
                name='comp-metric'
                className='h-8 w-8'
              />
              <TooltipIncentive activeTab={activeTab}>
                <Text
                  weight='700'
                  size='32'
                  className='cursor-pointer'
                >
                  {Format.token(metrics.totalIncentives, 'standard')}
                </Text>
              </TooltipIncentive>
            </div>
            <Text
              weight='500'
              size='13'
              className='text-primary-14'
            >
              {Format.price(metrics.totalIncentivesUsdPrice, 'standard')}
            </Text>
          </div>
          <Icon
            name={
              theme === 'dark' ? 'compound-metric-logo' : 'comp-metric-light'
            }
            className='absolute top-[-25px] right-5 z-[1] h-[190px] w-[180px]'
          />
        </Card>
        <Card
          title={`${activeTimeTab} Revenue generated`}
          isLoading={isLoading}
          className={{
            container: 'max-w-full min-w-64',
            loading: 'h-[200px]',
            header: 'px-5 py-4',
            content:
              'bg-[url(/incentivesRevenueGeneratedLight.png)] bg-cover bg-no-repeat pb-[65px] dark:bg-[url(/incentivesRevenueGenerated.png)]'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <TooltipIncentive activeTab={activeTab}>
                <Text
                  weight='700'
                  size='32'
                  className='cursor-pointer'
                >
                  {Format.price(metrics.totalFeesGeneratedUsdPrice, 'standard')}
                </Text>
              </TooltipIncentive>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MetricBlock;
