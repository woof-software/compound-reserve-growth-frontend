import { ReactNode } from 'react';

import {
  BaseTooltip,
  BaseTooltipContent,
  BaseTooltipTrigger,
  Text
} from '@/shared/ui/atoms';

interface TooltipProps {
  children: ReactNode;
  content: string;
}

const Tooltip = ({ children, content }: TooltipProps) => {
  return (
    <BaseTooltip>
      <BaseTooltipTrigger asChild>{children}</BaseTooltipTrigger>
      <BaseTooltipContent>
        <Text
          size='12'
          className='text-primary-14 p-1 text-[11px] leading-4 font-normal'
        >
          {content}
        </Text>
      </BaseTooltipContent>
    </BaseTooltip>
  );
};

export { Tooltip };
