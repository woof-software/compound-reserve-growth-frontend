import { ReactNode } from 'react';

import {
  Tooltip as BaseTooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/ui/BaseTooltip/BaseTooltip';

interface TooltipProps {
  children: ReactNode;
  content: string;
}

export const Tooltip = ({ children, content }: TooltipProps) => {
  return (
    <BaseTooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </BaseTooltip>
  );
};
