'use client';

import React, { FC, useMemo } from 'react';

import { cn } from '@/shared/lib/classNames';
import { Each, Icon, Text, View } from '@/shared/ui/atoms';

interface OevOnCollateralProps {
  collaterals: string[];
}

const MAX_VISIBLE = 5;

const CollateralAvatars: FC<OevOnCollateralProps> = ({ collaterals = [] }) => {
  const visible = useMemo(
    () => collaterals?.slice(0, MAX_VISIBLE),
    [collaterals]
  );

  const extraCount = Math.max(0, collaterals?.length - MAX_VISIBLE);

  return (
    <div className='flex items-center gap-[5px]'>
      <Each
        data={visible}
        render={(collateral, index) => {
          return (
            <div
              key={index}
              className={cn(
                'outline-secondary-36 bg-secondary-36 relative ml-0 flex h-5 w-5 transform items-center justify-center rounded-full outline transition-transform duration-[320ms]',
                {
                  '-ml-[12px]': index !== 0
                }
              )}
              style={{
                zIndex: visible?.length - index
              }}
            >
              <Icon
                name={collateral || 'not-found-icon'}
                folder='collaterals'
                className='h-5 w-5'
              />
            </div>
          );
        }}
      />
      <View.Condition if={Boolean(extraCount)}>
        <Text
          size='13'
          lineHeight='160'
          className='transform transition-transform duration-[320ms]'
        >
          +{extraCount}
        </Text>
      </View.Condition>
    </div>
  );
};

export { CollateralAvatars };
