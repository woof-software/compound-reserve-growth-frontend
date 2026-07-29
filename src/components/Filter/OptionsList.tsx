import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { cn } from '@/shared/lib/classNames/classNames';
import { noop } from '@/shared/lib/utils/utils';
import Icon from '@/shared/ui/Icon/Icon';

export type OptionsListProps<T> = {
  options: T[];
  getLabel: (v: T) => string;
  getKey: (v: T) => string;
  selectedOptions: T[];
  onSelect?: (option: T) => void
};

export function OptionsList<T>(props: OptionsListProps<T>) {
  const {
    options,
    selectedOptions,
    onSelect = noop,
    getLabel,
    getKey,
  } = props;

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  const isSelected = (option: T) => {
    return selectedOptions?.some((o) => getKey(o) === getKey(option));
  };

  return (
    <ul>
      {options.map((option) => (
        <li
          key={getKey(option)}
          onClick={() => onSelect(option)}
          className={cn(
            'mr-0.5 flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-secondary-12 font-medium',
            isMobile ? 'text-primary-13 text-[14px]' : 'text-[11px]',
            isMobile && isSelected(option) && 'text-secondary-10',
          )}
        >
          <button className='w-full flex cursor-pointer items-center justify-between text-left'>
            {getLabel(option)}
            {isSelected(option) && <Icon name='check-stroke' className='h-4 w-4' />}
          </button>
        </li>
      ))}
    </ul>
  );
}