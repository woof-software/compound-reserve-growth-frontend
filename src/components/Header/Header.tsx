import { FC, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  commonRoutes,
  routeTitles,
  VALID_NAVIGATION_ROUTES
} from '@/app/providers/router/config';
import Each from '@/shared/ui/Each/Each';
import Icon from '@/shared/ui/Icon/Icon';
import Link from '@/shared/ui/Link/Link';
import NavLink from '@/shared/ui/NavLink/NavLink';

const navLinks = [
  {
    to: commonRoutes.TREASURY,
    title: routeTitles.TREASURY,
    icon: 'wallet'
  },

  {
    to: commonRoutes.RUNWAY,
    title: routeTitles.RUNWAY,
    icon: 'lightning'
  },

  {
    to: commonRoutes.REVENUE,
    title: routeTitles.REVENUE,
    icon: 'storage'
  }
];

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
          <Each
            data={navLinks}
            render={(link, index) => (
              <NavLink
                key={index}
                to={link.to}
                isActive={isActive(link.to)}
                className='text-secondary-10 h-[26px] gap-1.5 rounded-[2.25rem] px-3 py-1 text-[13px] leading-3 font-medium'
                activeClassName='bg-primary-16'
                leftIcon={
                  <Icon
                    name={link.icon}
                    className='h-3 w-3'
                  />
                }
              >
                {link.title}
              </NavLink>
            )}
          />
        </nav>
      </div>
    </header>
  );
};

export default Header;
