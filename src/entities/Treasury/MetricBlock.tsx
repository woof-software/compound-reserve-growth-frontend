import { memo } from 'react';

import Card from '@/shared/ui/Card/Card';
import Icon from '@/shared/ui/Icon/Icon';
import ValueMetricField from '@/shared/ui/ValueMetricField/ValueMetricField';

const MetricBlock = memo(() => {
  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-row gap-5'>
        <Card className={{ container: 'h-[200px] flex-1' }}>
          <ValueMetricField
            value='$115.6M'
            label='Total Non-Comp Value'
            badge='+50.7M'
            badgeType='positive'
            icon={
              <Icon
                name='wallet'
                className='h-8 w-8'
              />
            }
          />
        </Card>

        <Card className={{ container: 'h-[200px] flex-1' }}>
          <ValueMetricField
            value='$115.6M'
            label='Total Non-Comp Value'
            badge='+57M'
            badgeType='positive'
            icon={
              <Icon
                name='not-found-icon'
                className='h-8 w-8'
              />
            }
          />
        </Card>

        <Card className={{ container: 'h-[200px] flex-1' }}>
          <ValueMetricField
            value='$115.6M'
            label='Total Non-Comp Value'
            badge='+57M'
            badgeType='positive'
            icon={
              <Icon
                name='not-found-icon'
                className='h-8 w-8'
              />
            }
          />
        </Card>
      </div>

      <div className='flex flex-row gap-5'>
        <Card className={{ container: 'h-[225px] flex-1' }}>
          <ValueMetricField
            className={{
              container: 'gap-10'
            }}
            value='$115.6M'
            label='Total Non-Comp Value'
            badge='-57M'
            badgeType='negative'
            iconText='Total Value'
            icon={
              <Icon
                name='not-found-icon'
                className='h-8 w-8'
              />
            }
          />
        </Card>

        <Card className={{ container: 'h-[225px] flex-1' }}>
          <ValueMetricField
            className={{
              container: 'gap-10'
            }}
            value='$115.6M'
            label='Total Non-Comp Value'
            badge='-57M'
            badgeType='negative'
            iconText='Total Value'
            icon={
              <Icon
                name='not-found-icon'
                className='h-8 w-8'
              />
            }
          />
        </Card>
      </div>
    </div>
  );
});

export default MetricBlock;
