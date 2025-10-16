import { FC } from 'react';

import { commonRoutes } from '@/app/providers/router/config';
import Icon from '@/shared/ui/Icon/Icon';
import Link from '@/shared/ui/Link/Link';
import Text from '@/shared/ui/Text/Text';
import ThemeSwitcher from '@/shared/ui/ThemeSwitcher/ThemeSwitcher';

const version = import.meta.env.VITE_APP_VERSION;

const isVersioned = version && version.length > 0;

const Footer: FC = () => {
  return (
    <footer className='md:border-primary-17 px-3 md:border-t md:px-0'>
      <div className='mx-auto max-w-[1084px]'>
        <div className='flex justify-between py-6'>
          <div className='text-primary-14 flex items-center gap-6 text-[13px]'>
            <Link
              to='https://www.tally.xyz/gov/compound'
              className='group hover:text-primary-11 transition-colors'
            >
              <Text
                size='13'
                weight='500'
                className='text-primary-14 group-hover:text-primary-11 transition-colors'
              >
                Governance
              </Text>
            </Link>
            <Link
              to='https://t.me/dmitriywoof'
              className='group hover:text-primary-11 transition-colors'
            >
              <Text
                size='13'
                weight='500'
                className='text-primary-14 group-hover:text-primary-11 transition-colors'
              >
                Support
              </Text>
            </Link>
          </div>
          <ThemeSwitcher />
        </div>
        <div className='py-5'>
          <div className='flex flex-wrap items-center justify-center gap-2.5 md:justify-between md:gap-0'>
            <div className='flex items-center gap-10'>
              <Link to={commonRoutes.TREASURY}>
                <Icon
                  name='logo'
                  className='h-[28px] w-[121px]'
                  color='primary-11'
                  isRound={false}
                />
              </Link>
            </div>
            <div className='flex flex-col items-end gap-1'>
              <Text
                size='11'
                weight='500'
                className='text-primary-14'
              >
                ©2025 Compound Finance. All Rights Reserved
              </Text>
            </div>
          </div>
        </div>
        <Text
          size='11'
          className='text-primary-14 flex w-full pb-6 !text-center md:mx-auto md:w-[70%]'
        >
          The information displayed on this platform is for informational
          purposes only. The dashboards are based solely on publicly available
          on-chain data and are not intended to constitute investment advice or
          recommendations. Users should not rely on the data presented here as a
          basis for making investment decisions.
        </Text>
        {isVersioned && (
          <Text
            size='9'
            align='center'
            className='text-primary-14 w-full pb-6 text-center'
          >
            Build: {version}
          </Text>
        )}
      </div>
    </footer>
  );
};

export default Footer;
