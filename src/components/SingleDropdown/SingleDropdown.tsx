import React, { FC } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
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
}

const SingleDropdown: FC<SingleDropdownProps> = ({
  options,
  selectedValue,
  isOpen,
  triggerContentClassName,
  onToggle,
  onClose,
  onSelect,
  disabled
}) => {
  return (
    <div className={cn({ 'pointer-events-none': disabled })}>
      <Dropdown
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
      >
        <Each
          data={options}
          render={(el, index) => (
            <DropdownItem
              key={index}
              asset={el}
              onSelect={onSelect}
            />
          )}
        />
      </Dropdown>
    </div>
  );
};

export default SingleDropdown;
