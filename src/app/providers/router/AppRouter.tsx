import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { routesConfig } from './config';

export const AppRouter = () => {
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
