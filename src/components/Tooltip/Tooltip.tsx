import { ReactNode } from 'react';

import {
  Tooltip as BaseTooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/ui/BaseTooltip/BaseTooltip';
import Text from '@/shared/ui/Text/Text';

interface TooltipProps {
  children: ReactNode;
  content: string;
}

export const Tooltip = ({ children, content }: TooltipProps) => {
  return (
    <BaseTooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>
        <Text
          size='12'
          className='text-primary-14'
        >
          {content}
        </Text>
      </TooltipContent>
    </BaseTooltip>
  );
};
