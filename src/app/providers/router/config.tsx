import { JSX } from 'react';

import RevenuePage from '@/pages/RevenuePage/RevenuePage';
import RunwayPage from '@/pages/RunwayPage/RunwayPage';
import TreasuryPage from '@/pages/TreasuryPage/TreasuryPage';

export interface RouteConfig {
  path: string;
  element: JSX.Element;
}

export enum commonRoutes {
  REVENUE = '/revenue',
  RUNWAY = '/runway',
  TREASURY = '/treasury',
  NOT_FOUND = '*'
}

export const VALID_NAVIGATION_ROUTES = [
  commonRoutes.TREASURY,
  commonRoutes.RUNWAY,
  commonRoutes.REVENUE
] as const;

export const enum routeTitles {
  TREASURY = 'Treasury',
  RUNWAY = 'Runway',
  REVENUE = 'Revenue'
}

export const routesConfig: Record<commonRoutes, RouteConfig> = {
  [commonRoutes.TREASURY]: {
    path: commonRoutes.TREASURY,
    element: <TreasuryPage />
  },
  [commonRoutes.REVENUE]: {
    path: commonRoutes.REVENUE,
    element: <RevenuePage />
  },
  [commonRoutes.RUNWAY]: {
    path: commonRoutes.RUNWAY,
    element: <RunwayPage />
  },
  [commonRoutes.NOT_FOUND]: {
    path: commonRoutes.NOT_FOUND,
    element: <TreasuryPage />
  }
};
