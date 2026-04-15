import { Option } from '@/refactor/DropdownFilter/DropdownFilter';
import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';

interface DropdownFilterActionsProps {
  setAll: () => void;
  clearAll: () => void;
  selectedOptions: Option[];
}

export const DropdownFilterActions = (props: DropdownFilterActionsProps) => {
  const { setAll, clearAll, selectedOptions } = props;
  
  return (
    <div className={'p-2 lg:border-t-[0.25px] lg:border-border'}>
      <Button
        // disabled={isAllSelected}
        className={cn(
          'text-primary-14 w-[100%] hover:bg-secondary-40 h-[44px] lg:h-[30px] rounded-lg text-[11px] font-medium dark:hover:text-white',
          // {
          //   '!text-primary-14 !bg-transparent': isAllSelected,
          //   'mb-0': Boolean(value.length > 0)
          // }
        )}
        onClick={setAll}
      >
        Select All
      </Button>

      {selectedOptions.length > 0 && (
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