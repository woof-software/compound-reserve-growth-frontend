import { ButtonHTMLAttributes, FC, ReactNode } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button: FC<ButtonProps> = ({
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled}
      className={cn(
        'flex cursor-pointer items-center justify-center transition',
        { 'cursor-not-allowed': disabled },
        className
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};

export default Button;
