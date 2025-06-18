import { JSX } from 'react';

import RevenuePage from '@/pages/RevenuePage/RevenuePage';
import RunwayPage from '@/pages/RunwayPage/RunwayPage';
import TreasuryPage from '@/pages/TreasuryPage/TreasuryPage';

export interface RouteConfig {
  path: string;
  element: JSX.Element;
}

export const enum routeTitles {
  TREASURY = 'Treasury',
  RUNWAY = 'Runway',
  REVENUE = 'Revenue'
}

export const enum commonRoutes {
  REVENUE = '/revenue',
  RUNWAY = '/runway',
  TREASURY = '/treasury',
  NOT_FOUND = '*'
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
    element: <p>Not Found</p>
  }
};
