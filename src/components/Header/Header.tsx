import { FC, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  commonRoutes,
  routeTitles,
  VALID_NAVIGATION_ROUTES
} from '@/app/providers/router/config';
import Icon from '@/shared/ui/Icon/Icon';
import Link from '@/shared/ui/Link/Link';
import NavLink from '@/shared/ui/NavLink/NavLink';

const Header: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isValidRoute = (VALID_NAVIGATION_ROUTES as readonly string[]).includes(
    currentPath
  );

  const activeRoute = isValidRoute
    ? (currentPath as commonRoutes)
    : commonRoutes.TREASURY;

  useEffect(() => {
    if (!isValidRoute) {
      navigate(commonRoutes.TREASURY, { replace: true });
    }
  }, [currentPath, isValidRoute, navigate]);

  const isActive = (route: commonRoutes) => activeRoute === route;

  return (
    <header className='py-3'>
      <div className='flex items-center gap-5'>
        <Link to={commonRoutes.TREASURY}>
          <Icon
            name='logo'
            className='h-[28px] w-[121px]'
            color='primary-11'
          />
        </Link>

        <nav className='flex items-center gap-1.5'>
          <NavLink
            to={commonRoutes.TREASURY}
            isActive={isActive(commonRoutes.TREASURY)}
            className='text-secondary-10 gap-1.5 rounded-[2.25rem] px-3 py-1'
            activeClassName='bg-primary-16'
            leftIcon={
              <Icon
                name='wallet'
                className='h-3 w-3'
              />
            }
          >
            {routeTitles.TREASURY}
          </NavLink>
          <NavLink
            to={commonRoutes.RUNWAY}
            isActive={isActive(commonRoutes.RUNWAY)}
            className='text-secondary-10 gap-1.5 rounded-[2.25rem] px-3 py-1'
            activeClassName='bg-primary-16'
            leftIcon={
              <Icon
                name='lightning'
                className='h-3 w-3'
              />
            }
          >
            {routeTitles.RUNWAY}
          </NavLink>
          <NavLink
            to={commonRoutes.REVENUE}
            isActive={isActive(commonRoutes.REVENUE)}
            className='text-secondary-10 gap-1.5 rounded-[2.25rem] px-3 py-1'
            activeClassName='bg-primary-16'
            leftIcon={
              <Icon
                name='storage'
                className='h-3 w-3'
              />
            }
          >
            {routeTitles.REVENUE}
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
