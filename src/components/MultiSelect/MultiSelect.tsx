import React, {
  ChangeEvent,
  FC,
  KeyboardEvent,
  Ref,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { useModal } from '@/shared/hooks/useModal';
import { cn } from '@/shared/lib/classNames/classNames';
import { OptionType } from '@/shared/types/types';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import { Dropdown } from '@/shared/ui/Dropdown/Dropdown';
import Each from '@/shared/ui/Each/Each';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

const CustomDropdownItem: FC<{
  label: string;
  marketType?: string;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: () => void;
  itemRef?: Ref<HTMLDivElement>;
}> = ({ label, isSelected, isHighlighted, onSelect, itemRef }) => {
  return (
    <div
      ref={itemRef}
      className={cn(
        'flex cursor-pointer items-center justify-between p-3',
        isHighlighted ? 'bg-secondary-12' : 'hover:bg-secondary-12'
      )}
      onClick={onSelect}
    >
      <div className='flex items-end gap-1'>
        <span className='text-color-gray-11 rounded-sm text-[12px]'>
          {label}
        </span>
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
  options: OptionType[];
  placeholder?: string;
  onChange?: (selectedOptions: OptionType[]) => void;
  className?: string;
  value?: OptionType[];
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
  const { isOpen, onOpenModal, onCloseModal } = useModal();

  const [searchValue, setSearchValue] = useState('');

  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [options, searchValue]
  );

  const onChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setHighlightedIndex(-1);
  };

  const onSelect = (optionToToggle: OptionType) => {
    if (!onChange) return;

    const isSelected = value.some((v) => v.id === optionToToggle.id);

    const newSelectedValue = isSelected
      ? value.filter((v) => v.id !== optionToToggle.id)
      : [...value, optionToToggle];

    onChange(newSelectedValue);
  };

  const onClearFilters = () => {
    if (onChange) onChange([]);

    onCloseModal();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const option = filteredOptions[highlightedIndex];
          onSelect(option);
          setSearchValue('');
          onCloseModal();
        }
        break;

      case 'Escape':
        e.preventDefault();
        setSearchValue('');
        onCloseModal();
        break;
    }
  };

  const onCloseDropdown = () => {
    onCloseModal();

    setSearchValue('');
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

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);

      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (highlightedIndex >= 0 && containerRef.current) {
      if (highlightedIndex === 0) {
        containerRef.current.scrollTo({ top: 0 });
      } else {
        const ref = itemRefs.current[highlightedIndex];

        ref?.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className={cn({ 'pointer-events-none': disabled })}>
      <Dropdown
        open={isOpen}
        onToggle={onOpenModal}
        onClose={onCloseDropdown}
        triggerContent={customTrigger}
        contentClassName='p-0'
      >
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        >
          <View.Condition if={options.length > 5}>
            <div className='outline-secondary-19 py-2 pr-5 pl-3 outline'>
              <input
                ref={inputRef}
                className='placeholder:text-secondary-21 h-[19px] w-full focus-visible:outline-none'
                placeholder='Search'
                value={searchValue}
                onChange={onChangeSearch}
              />
            </div>
          </View.Condition>
          <div className='max-h-[165px] overflow-auto'>
            {filteredOptions.map((option, index) => {
              const isSelected = value.some((v) => v.id === option.id);
              const isHighlighted = index === highlightedIndex;
              return (
                <CustomDropdownItem
                  key={option.id}
                  label={option.label}
                  marketType={option.marketType}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted}
                  onSelect={() => onSelect(option)}
                  itemRef={(el) => {
                    itemRefs.current[index] = el!;
                  }}
                />
              );
            })}
          </div>
        </div>
        {value.length > 0 && (
          <Button
            className='bg-secondary-12 sticky bottom-[-1px] w-full cursor-pointer border-t border-t-[#F9FAFB26] p-1 text-[11px] text-[--primary-13]'
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        )}
      </Dropdown>
    </div>
  );
};

export const MultiSelectDrawer: FC<MultiSelectProps> = ({
  options,
  placeholder = 'Chain',
  onChange,
  value = [],
  disabled = false
}) => {
  const { isOpen, onOpenModal, onCloseModal } = useModal();

  const [searchValue, setSearchValue] = useState('');

  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [options, searchValue]
  );

  const onChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const onSelect = (optionToToggle: OptionType) => {
    if (!onChange) return;

    const isSelected = value.some((v) => v.id === optionToToggle.id);

    const newSelectedValue = isSelected
      ? value.filter((v) => v.id !== optionToToggle.id)
      : [...value, optionToToggle];

    onChange(newSelectedValue);
  };

  return (
    <div className={cn({ 'pointer-events-none': disabled })}>
      <div
        className='bg-secondary-14 flex items-center justify-between rounded-[100px] p-3'
        onClick={onOpenModal}
      >
        <div className='flex items-center gap-1.5'>
          <Icon
            name='plus'
            className='h-4 w-4'
            color='color-secondary-28'
          />
          <Text
            size='14'
            weight='500'
          >
            {placeholder}
          </Text>
        </div>
        <div className='bg-white-10 flex h-5 w-5 items-center justify-center rounded-full'>
          <Text
            size='11'
            weight='500'
            className='leading-none !text-[color:var(--color-gray-12)] tabular-nums'
          >
            {value.length}
          </Text>
        </div>
      </div>
      <Drawer
        isOpen={isOpen}
        onClose={onCloseModal}
      >
        <Text
          size='17'
          weight='700'
          lineHeight='140'
          align='center'
          className='mb-8 w-full'
        >
          {placeholder}
        </Text>
        <View.Condition if={options.length > 5}>
          <div className='outline-secondary-19 rounded-lg py-2 pr-5 pl-3 outline'>
            <input
              className='placeholder:text-secondary-21 h-[19px] w-full focus-visible:outline-none'
              placeholder='Search'
              value={searchValue}
              onChange={onChangeSearch}
            />
          </div>
        </View.Condition>
        <div className='mt-8 max-h-[450px] overflow-y-auto'>
          <Each
            data={filteredOptions}
            render={(option, index) => {
              const isSelected = value.some((v) => v.id === option.id);

              return (
                <div
                  key={index}
                  className={cn(
                    'hover:bg-secondary-12 flex cursor-pointer items-center justify-between py-3'
                  )}
                  onClick={() => onSelect(option)}
                >
                  <div className='flex items-end gap-1'>
                    <span className='text-color-gray-11 rounded-sm text-sm font-medium'>
                      {option.label}
                    </span>
                  </div>
                  <View.Condition if={isSelected}>
                    <Icon
                      name='check-stroke'
                      className='h-4 w-4'
                    />
                  </View.Condition>
                </div>
              );
            }}
          />
        </div>
      </Drawer>
    </div>
  );
};
