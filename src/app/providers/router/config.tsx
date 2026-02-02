import { JSX } from 'react';

import CapoPage from '@/pages/CapoPage/CapoPage';
import IncentivePage from '@/pages/InsentivePage/IncentivePage';
// TODO: OEV Page has to be hidden until it is finalized
// import OEVPage from '@/pages/OEVPage/OEVPage';
import RevenuePage from '@/pages/RevenuePage/RevenuePage';
import RunwayPage from '@/pages/RunwayPage/RunwayPage';
import SpendingsPage from '@/pages/SpendingsPage/SpendingsPage';
import TreasuryPage from '@/pages/TreasuryPage/TreasuryPage';

export interface RouteConfig {
  path: string;
  element: JSX.Element;
}

export enum commonRoutes {
  REVENUE = '/revenue',
  RUNWAY = '/runway',
  TREASURY = '/treasury',
  SPENDINGS = '/spendings',
  INCENTIVES = '/incentives',
  // TODO: OEV Page has to be hidden until it is finalized
  // OEV = '/oev',
  CAPO = '/capo',
  NOT_FOUND = '*'
}

export const VALID_NAVIGATION_ROUTES = [
  commonRoutes.TREASURY,
  commonRoutes.RUNWAY,
  commonRoutes.REVENUE,
  commonRoutes.SPENDINGS,
  commonRoutes.INCENTIVES,
  // TODO: OEV Page has to be hidden until it is finalized
  // commonRoutes.OEV,
  commonRoutes.CAPO
] as const;

export const enum routeTitles {
  TREASURY = 'Treasury',
  RUNWAY = 'Runway',
  REVENUE = 'Revenue',
  SPENDINGS = 'Spendings',
  INCENTIVES = 'Incentives',
  CAPO = 'CAPO'
  // TODO: OEV Page has to be hidden until it is finalized
  // OEV = 'OEV'
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
  [commonRoutes.SPENDINGS]: {
    path: commonRoutes.SPENDINGS,
    element: <SpendingsPage />
  },
  [commonRoutes.INCENTIVES]: {
    path: commonRoutes.INCENTIVES,
    element: <IncentivePage />
  },
  // TODO: OEV Page has to be hidden until it is finalized
  // [commonRoutes.OEV]: {
  //   path: commonRoutes.OEV,
  //   element: <OEVPage />
  // },
  [commonRoutes.CAPO]: {
    path: commonRoutes.CAPO,
    element: <CapoPage />
  },
  [commonRoutes.NOT_FOUND]: {
    path: commonRoutes.NOT_FOUND,
    element: <TreasuryPage />
  }
};
