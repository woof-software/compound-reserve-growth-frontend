import { JSX } from 'react';

import InsentivePage from '@/pages/InsentivePage/InsentivePage';
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
  INCENTIVES = '/incentives',
  OEV = '/oev',
  NOT_FOUND = '*'
}

export const VALID_NAVIGATION_ROUTES = [
  commonRoutes.TREASURY,
  commonRoutes.RUNWAY,
  commonRoutes.REVENUE
  // commonRoutes.INCENTIVES,
  // commonRoutes.OEV
] as const;

export const enum routeTitles {
  TREASURY = 'Treasury',
  RUNWAY = 'Runway',
  REVENUE = 'Revenue',
  INCENTIVES = 'Incentives',
  OEV = 'OEV'
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
  [commonRoutes.INCENTIVES]: {
    path: commonRoutes.INCENTIVES,
    element: <InsentivePage />
  },
  [commonRoutes.OEV]: {
    path: commonRoutes.OEV,
    element: <div>OEV</div>
  },
  [commonRoutes.NOT_FOUND]: {
    path: commonRoutes.NOT_FOUND,
    element: <TreasuryPage />
  }
};
