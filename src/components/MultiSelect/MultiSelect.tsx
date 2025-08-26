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
import { Dropdown } from '@/shared/ui/Dropdown/Dropdown';
import Each from '@/shared/ui/Each/Each';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

export interface MultiSelectProps {
  options: OptionType[];

  placeholder?: string;

  onChange?: (selectedOptions: OptionType[]) => void;

  className?: string;

  value?: OptionType[];

  disabled?: boolean;
}

interface CustomDropdownProps {
  label: string;

  marketType?: string;

  isSelected: boolean;

  isHighlighted: boolean;

  onSelect: () => void;

  itemRef?: Ref<HTMLDivElement>;
}

interface MultiSelectDrawerProps {
  value: OptionType[];

  placeholder?: string;

  className?: string;
}

const CustomDropdownItem: FC<CustomDropdownProps> = ({
  label,
  isSelected,
  isHighlighted,
  onSelect,
  itemRef
}) => {
  return (
    <div
      ref={itemRef}
      className={cn(
        'mr-0.5 flex cursor-pointer items-center justify-between rounded-lg p-3',
        isHighlighted ? 'bg-secondary-12' : 'hover:bg-secondary-12'
      )}
      onClick={onSelect}
    >
      <div className='flex items-end gap-1'>
        <Text
          size='11'
          weight='500'
          lineHeight='16'
          className='text-color-gray-11 rounded-sm'
        >
          {label}
        </Text>
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

const MultiSelectTrigger: FC<MultiSelectDrawerProps> = ({
  value,
  placeholder,
  className
}) => {
  return (
    <div
      className={cn(
        'bg-custom-trigger flex items-center gap-1.5 rounded-full p-1.5 pr-3',
        className
      )}
    >
      <View.Condition if={Boolean(value.length > 0)}>
        <div className='bg-secondary-29 flex h-5 w-5 items-center justify-center rounded-full'>
          <Text
            size='11'
            weight='500'
            className='text-secondary-43 leading-none tabular-nums'
          >
            {value.length}
          </Text>
        </div>
      </View.Condition>
      <View.Condition if={!Boolean(value.length > 0)}>
        <div className='p-0.5'>
          <Icon
            name='plus'
            className='h-4 w-4'
            color='color-gray-11'
          />
        </div>
      </View.Condition>
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
};

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

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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
        triggerContent={
          <MultiSelectTrigger
            value={value}
            placeholder={placeholder}
            className={className}
          />
        }
        contentClassName='p-0 border-none shadow-15 max-h-[300px]'
      >
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onClick={(e) => e.stopPropagation()}
        >
          <View.Condition if={options.length > 5}>
            <div
              className={cn(
                'outline-secondary-19 m-2 flex h-10 justify-center rounded-lg py-2.5 pr-5 pl-3 outline',
                {
                  'outline-red-11':
                    !Boolean(filteredOptions.length) &&
                    Boolean(searchValue.length)
                }
              )}
            >
              <input
                ref={inputRef}
                className='placeholder:text-secondary-21 h-[19px] w-full placeholder:text-[12px] placeholder:font-medium focus-visible:outline-none'
                placeholder='Search'
                value={searchValue}
                onChange={onChangeSearch}
              />
            </div>
            <View.Condition if={Boolean(!filteredOptions.length)}>
              <div className='p-2 pt-0'>
                <Text
                  size='11'
                  weight='400'
                  lineHeight='100'
                  className='text-red-11'
                >
                  No results found
                </Text>
              </div>
            </View.Condition>
          </View.Condition>
          <View.Condition if={Boolean(filteredOptions.length)}>
            <div
              aria-hidden='true'
              className='bg-secondary-29 h-px w-full origin-top scale-y-[.5] transform-gpu'
            />
            <div className='my-2 mr-[3px] ml-2 grid max-h-[131px] gap-y-1 overflow-auto'>
              <Each
                data={filteredOptions}
                render={(option, index) => {
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
                }}
              />
            </div>
          </View.Condition>
        </div>
        <View.Condition if={Boolean(value.length > 0)}>
          <div
            aria-hidden='true'
            className='bg-secondary-29 h-px w-full origin-top scale-y-[.5] transform-gpu'
          />
          <Button
            className='bg-secondary-12 text-primary-14 hover:bg-secondary-40 m-2 h-[30px] rounded-lg px-3 py-2 text-[11px] font-medium dark:hover:text-white'
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        </View.Condition>
      </Dropdown>
    </div>
  );
};
