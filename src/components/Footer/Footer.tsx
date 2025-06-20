import { FC } from 'react';

import { commonRoutes } from '@/app/providers/router/config';
import { Logo } from '@/assets/svg/icon';
import Link from '@/shared/ui/Link/Link';
import Text from '@/shared/ui/Text/Text';
import ThemeSwitcher from '@/shared/ui/ThemeSwitcher/ThemeSwitcher';

const navLinks = [
  { label: 'Treasury', to: '#' },
  { label: 'Runway', to: '#' },
  { label: 'Revenue', to: '#' },
  { label: 'Support', to: '#' },
  { label: 'About', to: '#' },
  { label: 'Terms of Service', to: '#' },
  { label: 'Privacy Policy', to: '#' }
];

const topLinks = [
  { label: 'Governance', to: '#' },
  { label: 'Terms', to: '#' }
];

const Footer: FC = () => {
  return (
    <footer className='border-primary-17 border-t'>
      <div className='mx-auto max-w-[1084px]'>
        <div className='flex justify-between py-6'>
          <div className='text-primary-14 flex items-center gap-6 text-[13px]'>
            {topLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className='transition-colors'
              >
                <Text
                  size='13'
                  weight='500'
                  className='text-primary-14'
                >
                  {link.label}
                </Text>
              </Link>
            ))}
          </div>

          <ThemeSwitcher />
        </div>

        <div className='py-5'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Link to={commonRoutes.TREASURY}>
                <Logo />
              </Link>
            </div>

            <nav className='text-primary-14 flex items-center gap-5 text-[11px]'>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                >
                  <Text
                    size='11'
                    weight='500'
                    className='text-primary-14'
                  >
                    {link.label}
                  </Text>
                </Link>
              ))}
            </nav>

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
