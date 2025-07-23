import { FC } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import { Dropdown, useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

export interface Option {
  id: string;

  label: string;

  marketType?: string;
}

const CustomDropdownItem: FC<{
  label: string;
  marketType?: string;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ label, marketType, isSelected, onSelect }) => {
  return (
    <div
      className='hover:bg-secondary-12 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2'
      onClick={onSelect}
    >
      <div className='flex items-center gap-1'>
        <span className='text-color-gray-11 rounded-sm text-[12px]'>
          {label}
        </span>
        <View.Condition if={Boolean(marketType)}>
          <span className='text-primary-14 rounded-sm text-[12px]'>
            ({marketType})
          </span>
        </View.Condition>
      </div>
      {isSelected && (
        <Icon
          name='check-stroke'
          className='h-4 w-4'
        />
      )}
    </div>
  );
};

export interface MultiSelectProps {
  options: Option[];
  placeholder?: string;
  onChange?: (selectedOptions: Option[]) => void;
  className?: string;
  value?: Option[];
  disabled?: boolean;
}

export const MultiSelect: FC<MultiSelectProps> = ({
  options,
  placeholder = 'Chain',
  onChange,
  className = '',
  value = [],
  disabled = false
}) => {
  const { open, toggle, close } = useDropdown('multiple');

  const handleSelect = (optionToToggle: Option) => {
    if (!onChange) return;

    const isSelected = value.some((v) => v.id === optionToToggle.id);
    let newSelectedValue: Option[];

    if (isSelected) {
      newSelectedValue = value.filter((v) => v.id !== optionToToggle.id);
    } else {
      newSelectedValue = [...value, optionToToggle];
    }
    onChange(newSelectedValue);
  };

  const handleClearFilters = () => {
    if (onChange) {
      onChange([]);
    }
    close();
  };

  const customTrigger = (
    <div
      className={cn(
        'bg-custom-trigger flex items-center gap-1.5 rounded-full px-3 py-2',
        className
      )}
    >
      {value.length > 0 ? (
        <div className='bg-white-10 flex h-4 w-4 items-center justify-center rounded-full'>
          <Text
            size='11'
            weight='500'
            className='leading-none !text-[color:var(--color-gray-12)] tabular-nums'
          >
            {value.length}
          </Text>
        </div>
      ) : (
        <Icon
          name='plus'
          className='h-4 w-4'
          color='color-gray-11'
        />
      )}
      <Text
        size='11'
        weight='500'
        className={
          value.length > 0
            ? '!text-[var(--color-secondary-10)]'
            : '!text-[var(--color-gray-11)]'
        }
      >
        {placeholder}
      </Text>
    </div>
  );

  return (
    <div className={cn({ 'pointer-events-none': disabled })}>
      <Dropdown
        open={open}
        onToggle={toggle}
        onClose={close}
        triggerContent={customTrigger}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <div className='p-1'>
            {options.map((option) => {
              const isSelected = value.some((v) => v.id === option.id);
              return (
                <CustomDropdownItem
                  key={option.id}
                  label={option.label}
                  marketType={option.marketType}
                  isSelected={isSelected}
                  onSelect={() => handleSelect(option)}
                />
              );
            })}
          </div>
          {value.length > 0 && (
            <Button
              className={
                'bg-secondary-12 text-[--primary-13 sticky bottom-0 w-full cursor-pointer border-t-[0.5px] border-t-[#F9FAFB26] p-1 text-[11px]'
              }
              onClick={handleClearFilters}
            >
              Clear filters
            </Button>
          )}
        </div>
      </Dropdown>
    </div>
  );
};
