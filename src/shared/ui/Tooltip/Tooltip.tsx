import { ReactNode } from 'react';

import {
  Tooltip as BaseTooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/ui/BaseTooltip/BaseTooltip';
import Text from '@/shared/ui/Text/Text';

interface TooltipProps {
  children: ReactNode;
  content: string | ReactNode;

  open?: boolean;

  onOpenChange?: (open: boolean) => void;
}

export const Tooltip = ({
  children,
  content,
  open,
  onOpenChange
}: TooltipProps) => {
  return (
    <BaseTooltip
      open={open}
      onOpenChange={onOpenChange}
    >
      <TooltipTrigger asChild>{children}</TooltipTrigger>
        {content && (
          <TooltipContent>
            {typeof content === 'string' && (
              <Text
                size='12'
                className='text-primary-14 p-1 text-[11px] leading-4 font-normal'
              >
                {content}
              </Text>
            )}
            {typeof content !== 'string' && content}
          </TooltipContent>
        )}
    </BaseTooltip>
  );
};
