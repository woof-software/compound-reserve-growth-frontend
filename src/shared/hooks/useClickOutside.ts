import { useEffect } from 'react';

/**
 * Hook that alerts clicks outside the passed ref
 * @param ref
 * @param onClickOutside
 */
const useClickOutside = (ref: any, onClickOutside: () => void) => {
  /**
   * Handle passed click outside
   */
  const onClick = (event: any) => {
    if (ref.current && !ref.current.contains(event.target)) {
      onClickOutside();
    }
  };

  useEffect(() => {
    // Bind the event listener
    document.addEventListener('mousedown', onClick);
    document.addEventListener('touchstart', onClick);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('touchstart', onClick);
    };
  });
};

export { useClickOutside };
