import { FC } from 'react';

import { commonRoutes } from '@/app/providers/router/config';
import Icon from '@/shared/ui/Icon/Icon';
import Link from '@/shared/ui/Link/Link';
import Text from '@/shared/ui/Text/Text';
import ThemeSwitcher from '@/shared/ui/ThemeSwitcher/ThemeSwitcher';

const Footer: FC = () => {
  return (
    <footer className='border-primary-17 border-t'>
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
          </div>
          <ThemeSwitcher />
        </div>
        <div className='py-5'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-10'>
              <Link to={commonRoutes.TREASURY}>
                <Icon
                  name='logo'
                  className='h-[28px] w-[121px]'
                  color='primary-11'
                />
              </Link>
              <nav className='text-primary-14 flex items-center gap-5 text-[11px]'>
                <Link
                  to='https://t.me/dmitriywoof'
                  className='group hover:text-primary-11 transition-colors'
                >
                  <Text
                    size='11'
                    weight='500'
                    className='text-primary-14 group-hover:text-primary-11 transition-colors'
                  >
                    Support
                  </Text>
                </Link>
              </nav>
            </div>
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
    </footer>
  );
};

export default Footer;
