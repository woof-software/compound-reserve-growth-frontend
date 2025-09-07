import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGroup, motion } from 'framer-motion';

import {
  commonRoutes,
  routeTitles,
  VALID_NAVIGATION_ROUTES
} from '@/app/providers/router/config';
import { cn } from '@/shared/lib/classNames/classNames';
import Each from '@/shared/ui/Each/Each';
import Icon from '@/shared/ui/Icon/Icon';
import Link from '@/shared/ui/Link/Link';
import NavLink from '@/shared/ui/NavLink/NavLink';
import Portal from '@/shared/ui/Portal/Portal';
import Text from '@/shared/ui/Text/Text';
import { Tooltip } from '@/shared/ui/Tooltip/Tooltip';

const navLinks = [
  { to: commonRoutes.TREASURY, title: routeTitles.TREASURY, icon: 'wallet' },
  { to: commonRoutes.RUNWAY, title: routeTitles.RUNWAY, icon: 'lightning' },
  { to: commonRoutes.REVENUE, title: routeTitles.REVENUE, icon: 'storage' },
  {
    to: commonRoutes.INCENTIVES,
    title: routeTitles.INCENTIVES,
    icon: 'diamond'
  },
  {
    to: commonRoutes.OEV,
    title: routeTitles.OEV,
    icon: 'search',
    isComingSoon: true
  },
  {
    to: commonRoutes.CAPO,
    title: routeTitles.CAPO,
    icon: 'capo'
  }
];

const MotionDiv = motion.div;

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : clickedIndex;

  const isValidRoute = (VALID_NAVIGATION_ROUTES as readonly string[]).includes(
    currentPath
  );

  const activeRoute = isValidRoute
    ? (currentPath as commonRoutes)
    : commonRoutes.TREASURY;

  const isActive = (route: commonRoutes) => activeRoute === route;

  const onToggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    const isComingSoonRoute = navLinks.some(
      (link) => link.to === currentPath && link.isComingSoon
    );

    if (!isValidRoute && !isComingSoonRoute) {
      navigate(commonRoutes.TREASURY, { replace: true });
    }
  }, [currentPath, isValidRoute, navigate]);

  useEffect(() => {
    const foundIndex = navLinks.findIndex((link) => link.to === activeRoute);

    if (foundIndex !== -1) {
      setClickedIndex(foundIndex);
    }
  }, [activeRoute]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('disable-scroll-vertical');
    } else {
      document.body.classList.remove('disable-scroll-vertical');
    }
    return () => document.body.classList.remove('disable-scroll-vertical');
  }, [isOpen]);

  return (
    <header className='z-[1000] px-3 py-3 md:mt-4 md:px-0 md:py-[8.5px]'>
      <div className='mx-auto flex w-full max-w-[1084px] items-center justify-between gap-5 md:justify-start'>
        <Link to={commonRoutes.TREASURY}>
          <Icon
            name='logo'
            className='h-[27px] w-[121px]'
            color='primary-11'
            isRound={false}
          />
        </Link>
        <LayoutGroup>
          <nav className='hidden items-center gap-1.5 md:flex'>
            <Each
              data={navLinks}
              render={(link, index) =>
                link.isComingSoon ? (
                  <Tooltip
                    key={index}
                    content='Coming Soon'
                  >
                    <div className='flex cursor-not-allowed items-center gap-1.5 px-1 py-1 text-[13px] leading-3 opacity-30'>
                      <Icon
                        name={link.icon}
                        className='h-3 w-3'
                        color='color-gray-11'
                      />
                      <Text
                        className='text-color-gray-11'
                        size='13'
                        weight='500'
                      >
                        {link.title}
                      </Text>
                    </div>
                  </Tooltip>
                ) : (
                  <div
                    key={index}
                    className='relative'
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setClickedIndex(index)}
                  >
                    {index === activeIndex && (
                      <MotionDiv
                        layoutId='nav-highlight'
                        className='bg-primary-16 absolute inset-0 rounded-[2.25rem] shadow-md'
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 40
                        }}
                      />
                    )}
                    <NavLink
                      to={link.to}
                      isActive={isActive(link.to)}
                      className='text-secondary-10 relative z-10 h-[26px] gap-1.5 rounded-[2.25rem] px-3 py-1 text-[13px] leading-3'
                      activeClassName='text-white'
                      leftIcon={
                        <Icon
                          name={link.icon}
                          className='h-3 w-3'
                          isRound={false}
                          color='color-gray-11'
                        />
                      }
                    >
                      <Text
                        className='text-color-gray-11'
                        size='13'
                        weight='500'
                      >
                        {link.title}
                      </Text>
                    </NavLink>
                  </div>
                )
              }
            />
          </nav>
        </LayoutGroup>
        <button
          className='p4 bg-secondary-24 flex h-11 w-11 items-center justify-center rounded-full md:hidden'
          onClick={onToggle}
        >
          <Icon
            name={isOpen ? 'close-menu' : 'burger-menu'}
            className='text-secondary-25 h-4 w-4'
          />
        </button>
      </div>
      <Portal>
        <aside
          className={cn(
            'bg-background fixed top-[68px] right-0 z-[100] h-full w-full translate-x-full transform p-10 transition-transform duration-300 ease-in-out',
            { 'translate-x-0': isOpen }
          )}
        >
          <div className='flex h-full flex-col justify-center gap-2'>
            <Each
              data={navLinks}
              render={(link, index) =>
                link.isComingSoon ? (
                  <div
                    key={index}
                    className='flex w-fit cursor-not-allowed opacity-60'
                    onClick={(e) => e.preventDefault()}
                  >
                    <Text
                      className='text-secondary-29 w-fit'
                      size='32'
                      lineHeight='36'
                      weight='500'
                    >
                      {link.title}
                    </Text>
                  </div>
                ) : (
                  <NavLink
                    key={index}
                    to={link.to}
                    isActive={isActive(link.to)}
                    onClick={onToggle}
                  >
                    <Text
                      className={cn('text-secondary-25 w-fit', {
                        'text-success-11': isActive(link.to)
                      })}
                      size='32'
                      lineHeight='36'
                      weight='500'
                    >
                      {link.title}
                    </Text>
                  </NavLink>
                )
              }
            />
          </div>
        </aside>
      </Portal>
    </header>
  );
};

export default Header;
