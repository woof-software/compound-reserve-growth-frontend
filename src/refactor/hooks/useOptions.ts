import { useState } from 'react'

type Option = {label: string; value: string}

export function useOptions(
  options: Option[],
  selectedKeys: string[],
  setSelectedKeys: (v: string[]) => void
) {
  const selectedOptions = options.filter(({ value }) => selectedKeys.includes(value));

  const setSelectedOptions = (v: Option | Option[]) => {
    if (Array.isArray(v)) {
      const values = new Set<string>();
      v.forEach(o => {
        if (values.has(o.value)) {
          values.delete(o.value);
        } else {
          values.add(o.value);
        }
      });
      setSelectedKeys([...values]);
    } else {
      const values = new Set(selectedKeys);
      if (values.has(v.value)) {
        values.delete(v.value);
      } else {
        values.add(v.value);
      }
      setSelectedKeys([...values]);
    }
  }

  return { selectedOptions, setSelectedOptions }
}