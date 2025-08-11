import React, { FC } from 'react';

import {
  Dropdown,
  DropdownItem,
  TriggerContent
} from '@/shared/ui/Dropdown/Dropdown';
import Each from '@/shared/ui/Each/Each';

interface SingleDropdownProps {
  options: string[];
  selectedValue?: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (value: string) => void;
  triggerContentClassName?: string;
  disabled?: boolean;
  contentClassName?: string;
}

const SingleDropdown: FC<SingleDropdownProps> = ({
  options,
  selectedValue,
  isOpen,
  triggerContentClassName,
  onToggle,
  onClose,
  onSelect,
  disabled,
  contentClassName
}) => {
  return (
    <Dropdown
      isDisabled={disabled}
      triggerContent={
        <TriggerContent
          className={triggerContentClassName}
          title={selectedValue || options[0]}
          isOpen={isOpen}
        />
      }
      open={isOpen}
      onToggle={onToggle}
      onClose={onClose}
      contentClassName={contentClassName}
    >
      <Each
        data={options}
        render={(el, index) => (
          <DropdownItem
            key={index}
            asset={el}
            onSelect={onSelect}
            isSelected={selectedValue === el}
          />
        )}
      />
    </Dropdown>
  );
};

export default SingleDropdown;
