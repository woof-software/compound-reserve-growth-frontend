import { useMediaQuery } from '@/refactor/hooks/useMediaQuery'
import { cn } from '@/shared/lib/classNames/classNames';
import { noop } from '@/shared/lib/utils/utils'
import Button from '@/shared/ui/Button/Button';

export interface DropdownFilterActionsProps {
  isAllSelected?: boolean
  setAll?: () => void
  clearAll?: () => void
  isAnySelect?: boolean;
}

export const DropdownFilterActions = (props: DropdownFilterActionsProps) => {
  const {
    setAll = noop,
    clearAll = noop,
    isAnySelect = false,
    isAllSelected = false
  } = props;

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  if (isMobile) {
    return (
      isAnySelect ? (
        <Button
          className='text-primary-14 hover:bg-secondary-40 w-full px-2 pt-8 pb-4 lg:h-[30px] rounded-lg text-[11px] font-medium dark:hover:text-white'
          onClick={clearAll}
        >
          Clear Selections
        </Button>
      ) : (
        <Button
          className='text-primary-14 hover:bg-secondary-40 w-full px-2 pt-8 pb-4 lg:h-[30px] rounded-lg text-[11px] font-medium dark:hover:text-white'
          onClick={setAll}
        >
          Select All
        </Button>
      )
    )
  }

  return (
    <div className={'p-2 lg:border-t-[0.25px] lg:border-border'}>
      <Button
        disabled={isAllSelected}
        className={cn(
          'text-primary-14 w-[100%] hover:bg-secondary-40 h-[44px] lg:h-[30px] rounded-lg text-[11px] font-medium dark:hover:text-white',
          {
            'text-primary-14 bg-transparent opacity opacity-50': isAllSelected,
          }
        )}
        onClick={setAll}
      >
        Select All
      </Button>

      {isAnySelect && (
        <Button
          className='bg-secondary-12 w-[100%] text-primary-14 hover:bg-secondary-40 mt-0.5 h-[44px] lg:h-[30px] rounded-lg text-[11px] font-medium dark:hover:text-white'
          onClick={clearAll}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
};