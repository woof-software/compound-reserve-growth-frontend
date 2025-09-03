import { Suspense, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { commonRoutes, routesConfig, VALID_NAVIGATION_ROUTES } from './config';

export const AppRouter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  useEffect(() => {
    const isValidRoute = (
      VALID_NAVIGATION_ROUTES as readonly string[]
    ).includes(currentPath);

    if (!isValidRoute && currentPath !== commonRoutes.NOT_FOUND) {
      navigate(commonRoutes.TREASURY, { replace: true });
    }
  }, [currentPath, navigate]);

  return (
    <Suspense fallback={null}>
      <Routes>
        {Object.values(routesConfig).map(({ element, path }) => (
          <Route
            key={path}
            path={path}
            element={element}
          />
        ))}
      </Routes>
    </Suspense>
  );
};
