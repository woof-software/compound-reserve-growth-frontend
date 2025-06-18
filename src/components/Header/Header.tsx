import { FC } from 'react';
import { useLocation } from 'react-router-dom';

import { commonRoutes, routeTitles } from '@/app/providers/router/config';
import Link from '@/shared/ui/Link/Link';
import NavLink from '@/shared/ui/NavLink/NavLink';

import LightningIcon from '@/assets/svg/lightning.svg';
import LogoIcon from '@/assets/svg/logo.svg';
import StorageIcon from '@/assets/svg/storage.svg';
import WalletIcon from '@/assets/svg/wallet.svg';

const Header: FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (route: commonRoutes) => currentPath === route;

  return (
    <header className='py-3'>
      <div className='flex items-center gap-5'>
        <Link to={commonRoutes.TREASURY}>
          <LogoIcon className='h-7 w-28' />
        </Link>

        <nav className='flex items-center gap-1.5'>
          <NavLink
            to={commonRoutes.TREASURY}
            isActive={isActive(commonRoutes.TREASURY)}
            className='gap-1.5 rounded-[2.25rem] px-3 py-1 text-gray-600'
            activeClassName='bg-[#d6dfe8]'
            leftIcon={<LightningIcon />}
          >
            {routeTitles.TREASURY}
          </NavLink>
          <NavLink
            to={commonRoutes.RUNWAY}
            isActive={isActive(commonRoutes.RUNWAY)}
            className='gap-1.5 rounded-[2.25rem] px-3 py-1 text-gray-600'
            activeClassName='bg-[#d6dfe8]'
            leftIcon={<StorageIcon />}
          >
            {routeTitles.RUNWAY}
          </NavLink>
          <NavLink
            to={commonRoutes.REVENUE}
            isActive={isActive(commonRoutes.REVENUE)}
            className='gap-1.5 rounded-[2.25rem] px-3 py-1 text-gray-600'
            activeClassName='bg-[#d6dfe8]'
            leftIcon={<WalletIcon />}
          >
            {routeTitles.REVENUE}
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
