import { useState } from 'react';

const useDropdown = (type: 'single' | 'multiple') => {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedValue, setSelectedValue] = useState<string[] | null>(null);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  const select = (value: string) => {
    if (type === 'single') {
      setSelectedValue([value]);
    } else {
      const newValues = selectedValue?.includes(value)
        ? selectedValue?.filter((v) => v !== value)
        : [...(selectedValue || []), value];

      setSelectedValue(newValues);
    }
  };

  const selectClose = (value: string) => {
    if (type === 'single') {
      setSelectedValue([value]);

      setIsOpen(false);
    } else {
      const newValues = selectedValue?.includes(value)
        ? selectedValue?.filter((v) => v !== value)
        : [...(selectedValue || []), value];

      setSelectedValue(newValues);
    }
  };

  return {
    isOpen,
    selectedValue,
    toggle,
    open,
    close,
    select,
    selectClose
  };
};

export { useDropdown };
