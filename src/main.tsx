import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App';

import './index.css';

//24 hours
const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Sets the time in milliseconds that query data is considered "fresh".
      // As long as the data is fresh, it will always be read from the cache without making a network request.
      staleTime: TWENTY_FOUR_HOURS_IN_MS,

      // Sets the time in milliseconds that inactive query data is kept in the cache (Garbage Collection Time).
      // When a query has no active components using it, its data will be deleted from the cache after this duration.
      gcTime: TWENTY_FOUR_HOURS_IN_MS + 5 * 60 * 1000, // 24 hours + 5 minutes

      // Disables the default behavior of refetching data automatically when the user focuses the browser window.
      // This is useful for our strategy since the data rarely changes.
      refetchOnWindowFocus: false,

      // Disables the default behavior of refetching data automatically when the network connection is re-established.
      // This prevents unnecessary requests after a temporary network loss.
      refetchOnReconnect: false,

      // Disables the default behavior of refetching data when a component using the query mounts.
      // With a long staleTime, this ensures we always use cached data on navigation instead of refetching.
      refetchOnMount: false
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);
