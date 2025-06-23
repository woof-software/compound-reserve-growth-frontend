import { ChangeEvent, MouseEvent as ReactMouseEvent } from 'react';

export const preventEventBubbling = (
  e: ReactMouseEvent<HTMLElement> | ChangeEvent<HTMLInputElement>
): void => {
  e.preventDefault();
  e.stopPropagation();
};
