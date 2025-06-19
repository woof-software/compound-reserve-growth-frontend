import { FC } from 'react';

import { commonRoutes } from '@/app/providers/router/config';
import Link from '@/shared/ui/Link/Link';

import LogoIcon from '@/assets/svg/logo.svg';

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
    <footer className='border-t border-gray-200'>
      <div className='mx-auto max-w-[1084px]'>
        <div className='py-6'>
          <div className='flex items-center gap-6 text-[13px] text-gray-600'>
            {topLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className='transition-colors hover:text-gray-900'
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className='py-5'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Link to={commonRoutes.TREASURY}>
                <LogoIcon className='h-7 w-28' />
              </Link>
            </div>

            <nav className='flex items-center gap-5 text-[11px] text-gray-600'>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className='transition-colors hover:text-gray-900'
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className='text-[11px] text-gray-500'>
              ©2025 Compound Finance. All Rights Reserved
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
