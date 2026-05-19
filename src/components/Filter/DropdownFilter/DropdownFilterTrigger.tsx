import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { cn } from '@/shared/lib/classNames/classNames';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

export interface DropdownFilterTriggerProps {
  label: string
  prefix: string
  onClick: () => void
}

export const DropdownFilterTrigger = (props: DropdownFilterTriggerProps) => {
  const { label, prefix, onClick } = props;
  
  const isMobile = useMediaQuery('(max-width: 63.938rem)');
  const hasSelectedOptions = prefix !== '';
  
  if (isMobile) {
    return (
      <button
        onClick={onClick}
        className={'flex w-full items-center cursor-pointer justify-between px-3 py-2.5 h-[42px] mb-3'}
      >
        <div className={'flex items-center gap-1.5'}>
          <Icon name='plus' className='h-2.5 w-2.5'  color={cn('primary-14', {
            'primary-13': hasSelectedOptions
          })} />
          <Text size='14' weight='500' className={hasSelectedOptions ? 'text-secondary-10' : 'text-primary-13'}>
            {label}
          </Text>
        </div>
        {hasSelectedOptions && (
          <div className={cn(
            'flex h-6 w-6 items-center justify-center rounded-sm bg-secondary-46',
            { 'px-2 w-auto': typeof prefix === 'string' }
          )}>
            <Text size='11' weight='500' className='text-primary-18'>
              {prefix}
            </Text>
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      className={cn('bg-custom-trigger flex items-center gap-1.5 rounded-lg px-3 h-8 cursor-pointer')}
      onClick={onClick}
    >
      {hasSelectedOptions
        ? <div className={'flex h-4 w-4 items-center justify-center rounded-sm bg-secondary-46'}>
          <Text size='11' weight='500' className='text-primary-18'>
            {prefix}
          </Text>
        </div>
        : <Icon name='plus' className='h-4 w-4' color='color-gray-11' />
      }
      <Text size='11' weight='500' className={hasSelectedOptions ? '!text-secondary-10' : '!text-gray-11'}>
        {label}
      </Text>
    </button>
  );
};