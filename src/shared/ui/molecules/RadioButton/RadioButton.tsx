import React, {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState
} from 'react';

import { cn } from '@/shared/lib/classNames';
import { View } from '@/shared/ui/atoms';

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

interface RadioProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'onChange' | 'value' | 'checked' | 'defaultChecked'
  > {
  value: string | number;

  label?: ReactNode;

  checked?: boolean;

  defaultChecked?: boolean;

  onChange?: (
    value: string | number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  className?: string;

  disabled?: boolean;
}

interface RadioLabelProps {
  label: string;

  className?: string;
}

const RadioGroupCtx = createContext<GroupContext | null>(null);

const useRadioGroupCtx = () => useContext(RadioGroupCtx);

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

  const [uncontrolled, setUncontrolled] = useState<Value | null>(defaultValue);

  const current = useMemo(() => value ?? uncontrolled, [value, uncontrolled]);

  const groupName = useMemo(() => name ?? `radio-${auto}`, [name]);

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

function RadioItem({
  value,
  label,
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

  return (
    <label
      className={cn(
        'group/radio inline-flex cursor-pointer items-center gap-5 select-none',
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
          circleSize,
          {
            'border-none': isChecked
          }
        )}
      >
        <span
          className={cn(
            'h-full w-full rounded-full transition-transform',
            isChecked
              ? 'bg-card-content border-success-13 scale-100 border-[6px]'
              : 'scale-0 bg-transparent'
          )}
        />
      </span>
      <span className='flex min-w-0 flex-col'>
        <View.Condition if={Boolean(label)}>{label}</View.Condition>
      </span>
    </label>
  );
}

const RadioLabel: FC<RadioLabelProps> = ({ label, className }) => {
  return (
    <span
      className={cn('text-primary-14 text-sm leading-4 font-medium', className)}
    >
      {label}
    </span>
  );
};

const Radio = {
  Group: RadioGroup,
  Label: RadioLabel,
  Item: RadioItem
};

export { Radio };
