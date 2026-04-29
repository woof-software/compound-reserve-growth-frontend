import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const controller = new AbortController();

    window
      .matchMedia(query)
      .addEventListener('change', (event) => {
        setMatches(event.matches);
      }, {
        signal: controller.signal,
      });

    return () => {
      controller.abort();
    }
  }, [query]);

  return matches;
}
