import { useEffect } from 'react';

/**
 * A custom hook that scrolls the page to an element whose ID is specified
 * in the URL hash (e.g., #my-element).
 * The scroll action is triggered when the `isReady` dependency becomes true.
 *
 * @param {boolean} isReady - A flag indicating that the page is ready to be scrolled (e.g., data has been loaded).
 */
export const useScrollToHash = (isReady: boolean) => {
  useEffect(() => {
    // Do nothing if the page is not ready yet (e.g., data is loading)
    if (!isReady) {
      return;
    }

    const hash = window.location.hash;

    // Do nothing if there is no hash in the URL
    if (!hash) {
      return;
    }

    const elementId = hash.substring(1);
    const element = document.getElementById(elementId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isReady]); // The effect runs only when the isReady state changes
};
