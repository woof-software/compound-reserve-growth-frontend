import React, { FC, Ref, useRef, useState } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import { Dropdown } from '@/shared/ui/Dropdown/Dropdown';
import Each from '@/shared/ui/Each/Each';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

type Option = {
  id: string;
  label: string;
  marketType?: string;
};

type SingleSelectProps = {
  options: Option[];
  value: Option | null;
  onChange: (value: Option | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: string;
  isClearable?: boolean;
};

interface CustomDropdownProps {
  label: string;
  marketType?: string;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: () => void;
  itemRef?: Ref<HTMLDivElement>;
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

const SingleSelectTrigger = ({
  value,
  placeholder,
  className
}: {
  value: Option | null;
  placeholder?: string;
  className?: string;
  type?: string;
}) => {
  return (
    <div
      className={cn(
        'bg-custom-trigger flex h-[32px] items-center gap-1.5 rounded-lg p-1.5 pr-3',
        {
          'pr-1.5': !value?.label
        },
        className
      )}
    >
      <View.Condition if={Boolean(value?.label)}>
        <div className='bg-secondary-46 flex items-center justify-center rounded-sm px-[10px] py-[2.5px]'>
          <Text
            size='11'
            weight='500'
            className='text-primary-18 leading-none tabular-nums'
          >
            {value?.label}
          </Text>
        </div>
      </View.Condition>
      <Text
        size='11'
        weight='500'
        className={'!text-[var(--color-gray-11)]'}
      >
        {placeholder}
      </Text>
    </div>
  );
};

const SingleSelect = ({
  options,
  value,
  onChange,
  placeholder,
  className,
  disabled,
  isClearable = false
}: SingleSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const filteredOptions = searchValue.length
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchValue.toLowerCase())
      )
    : options;

  const onOpenModal = () => {
    setIsOpen(true);
    setSearchValue('');
    setHighlightedIndex(0);
  };

  const onCloseDropdown = () => {
    setIsOpen(false);
    setSearchValue('');
    setHighlightedIndex(0);
  };

  const onSelect = (option: Option) => {
    onChange(option);
    onCloseDropdown();
  };

  const onClearSelection = () => {
    onChange(null);
    onCloseDropdown();
  };

  const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setHighlightedIndex(0);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
      itemRefs.current[highlightedIndex + 1]?.scrollIntoView({
        block: 'nearest'
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      itemRefs.current[highlightedIndex - 1]?.scrollIntoView({
        block: 'nearest'
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        onSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCloseDropdown();
    }
  };

  const hasSelection = value !== null;

  return (
    <div className={cn({ 'pointer-events-none': disabled })}>
      <Dropdown
        open={isOpen}
        onOpen={onOpenModal}
        onClose={onCloseDropdown}
        triggerContent={
          <SingleSelectTrigger
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
                  const isSelected = value?.id === option.id;
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
        <View.Condition if={hasSelection && isClearable}>
          <div
            aria-hidden='true'
            className='bg-secondary-29 h-px w-full origin-top scale-y-[.5] transform-gpu'
          />
          <Button
            className='bg-secondary-12 text-primary-14 hover:bg-secondary-40 m-2 h-[30px] rounded-lg px-3 py-2 text-[11px] font-medium dark:hover:text-white'
            onClick={onClearSelection}
          >
            Clear selection
          </Button>
        </View.Condition>
      </Dropdown>
    </div>
  );
};

export default SingleSelect;
