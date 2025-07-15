import { useCallback, useEffect, useRef, useState } from 'react';

export const useClipboard = (timeout = 2000) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        if (!navigator.clipboard) {
          throw new Error('Clipboard API not supported');
        }

        await navigator.clipboard.writeText(text);
        setCopied(true);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
          setCopied(false);
        }, timeout);
      } catch (error) {
        console.error('Failed to copy text: ', error);
        setCopied(false);
      }
    },
    [timeout]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [copied, copy] as const;
};
