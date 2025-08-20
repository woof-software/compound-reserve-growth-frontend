import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState
} from 'react';

import { cn } from '@/shared/lib/classNames/classNames';

import View from '../View/View';

type Value = string | number;

type Direction = 'horizontal' | 'vertical';

interface GroupContext {
  name: string;

  value: Value | null;

  disabled?: boolean;

  onChange?: (val: Value) => void;
}

interface RadioGroupProps {
  value?: Value | null;

  defaultValue?: Value | null;

  name?: string;

  onChange?: (val: Value) => void;

  disabled?: boolean;

  direction?: Direction;

  className?: string;

  children: ReactNode;

  'aria-label'?: string;

  'aria-labelledby'?: string;
}

const RadioGroupCtx = createContext<GroupContext | null>(null);
export const useRadioGroupCtx = () => useContext(RadioGroupCtx);

function RadioGroup({
  value,
  defaultValue = null,
  name,
  onChange,
  disabled,
  direction = 'horizontal',
  className,
  children,
  ...aria
}: RadioGroupProps) {
  const auto = useId().replace(/:/g, '');
  const groupName = name ?? `radio-${auto}`;

  const [uncontrolled, setUncontrolled] = useState<Value | null>(defaultValue);
  const current = value ?? uncontrolled;

  const onRadioChange = useCallback(
    (val: Value) => {
      if (onChange) onChange(val);
      else setUncontrolled(val);
    },
    [onChange]
  );

  const ctx = useMemo<GroupContext>(
    () => ({
      name: groupName,
      value: current,
      disabled,
      onChange: onRadioChange
    }),
    [groupName, current, disabled, onRadioChange]
  );

  return (
    <RadioGroupCtx.Provider value={ctx}>
      <div
        role='radiogroup'
        className={cn(
          'flex',
          direction === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-2',
          className
        )}
        {...aria}
      >
        {children}
      </div>
    </RadioGroupCtx.Provider>
  );
}

interface RadioProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'onChange' | 'value' | 'checked' | 'defaultChecked'
  > {
  value: string | number;

  label?: ReactNode;

  description?: ReactNode;

  checked?: boolean;

  defaultChecked?: boolean;

  onChange?: (
    value: string | number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  className?: string;

  disabled?: boolean;
}

function Radio({
  value,
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  className,
  disabled: disabledProp,
  ...rest
}: RadioProps) {
  const ctx = useRadioGroupCtx();

  const isInGroup = Boolean(ctx);
  const name = ctx?.name;
  const groupDisabled = ctx?.disabled ?? false;
  const disabled = disabledProp ?? groupDisabled;

  const isChecked = isInGroup ? ctx!.value === value : checked;

  const circleSize = 'h-5 w-5';
  const dotSize = 'h-2.5 w-2.5';

  return (
    <label
      className={cn(
        'group/radio inline-flex cursor-pointer items-start gap-5 select-none',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      <input
        type='radio'
        name={name}
        value={String(value)}
        className='peer sr-only'
        disabled={disabled}
        checked={isChecked}
        defaultChecked={isChecked === undefined ? defaultChecked : undefined}
        onChange={(e) => {
          if (ctx?.onChange) ctx.onChange(value);
          if (onChange) onChange(value, e);
        }}
        {...rest}
      />
      <span
        aria-hidden
        className={cn(
          'relative flex items-center justify-center rounded-full border transition',
          'border-secondary-23 bg-transparent',
          'peer-focus-visible:outline-primary-11 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2',
          circleSize
        )}
      >
        <span
          className={cn(
            'rounded-full transition-transform',
            dotSize,
            isChecked ? 'bg-primary-11 scale-100' : 'scale-0 bg-transparent'
          )}
        />
      </span>
      <span className='flex min-w-0 flex-col'>
        <View.Condition if={Boolean(label)}>
          <span className='text-secondary-33 text-sm leading-4'>{label}</span>
        </View.Condition>
        <View.Condition if={Boolean(description)}>
          <span className='text-primary-14 text-[12px] leading-5'>
            {description}
          </span>
        </View.Condition>
      </span>
    </label>
  );
}

export { Radio, RadioGroup };
