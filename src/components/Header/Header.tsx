import { FC } from 'react';
import { useLocation } from 'react-router-dom';

import {
  commonRoutes,
  routeTitles,
  VALID_NAVIGATION_ROUTES
} from '@/app/providers/router/config';
import { Logo } from '@/assets/svg/icon';
import Link from '@/shared/ui/Link/Link';
import NavLink from '@/shared/ui/NavLink/NavLink';

import LightningIcon from '@/assets/svg/lightning.svg';
import StorageIcon from '@/assets/svg/storage.svg';
import WalletIcon from '@/assets/svg/wallet.svg';

const Header: FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const activeRoute = (VALID_NAVIGATION_ROUTES as readonly string[]).includes(
    currentPath
  )
    ? (currentPath as commonRoutes)
    : commonRoutes.TREASURY;

  const isActive = (route: commonRoutes) => activeRoute === route;

  return (
    <header className='py-3'>
      <div className='flex items-center gap-5'>
        <Link to={commonRoutes.TREASURY}>
          <Logo />
        </Link>

        <nav className='flex items-center gap-1.5'>
          <NavLink
            to={commonRoutes.TREASURY}
            isActive={isActive(commonRoutes.TREASURY)}
            className='text-secondary-10 gap-1.5 rounded-[2.25rem] px-3 py-1'
            activeClassName='bg-primary-16'
            leftIcon={<WalletIcon />}
          >
            {routeTitles.TREASURY}
          </NavLink>
          <NavLink
            to={commonRoutes.RUNWAY}
            isActive={isActive(commonRoutes.RUNWAY)}
            className='text-secondary-10 gap-1.5 rounded-[2.25rem] px-3 py-1'
            activeClassName='bg-primary-16'
            leftIcon={<LightningIcon />}
          >
            {routeTitles.RUNWAY}
          </NavLink>
          <NavLink
            to={commonRoutes.REVENUE}
            isActive={isActive(commonRoutes.REVENUE)}
            className='text-secondary-10 gap-1.5 rounded-[2.25rem] px-3 py-1'
            activeClassName='bg-primary-16'
            leftIcon={<StorageIcon />}
          >
            {routeTitles.REVENUE}
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
