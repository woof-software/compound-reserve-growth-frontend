import { FC } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Text from '@/shared/ui/Text/Text';

interface NoDataPlaceholderProps {
  onButtonClick: () => void;
  text?: string;
  buttonText?: string;
  className?: string;
}

const NoDataPlaceholder: FC<NoDataPlaceholderProps> = ({
  onButtonClick,
  text = 'No data for selected filters',
  buttonText = 'Reset Filters',
  className
}) => {
  return (
    <div
      className={cn(
        'flex h-[400px] flex-col items-center justify-center gap-4',
        className
      )}
    >
      <Text
        size='12'
        className='text-primary-14'
      >
        {text}
      </Text>
      <Button
        onClick={onButtonClick}
        className='cursor-pointer rounded-md bg-[#00D395] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#00C48A] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#00D395]'
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default NoDataPlaceholder;
