import { ButtonHTMLAttributes, FC, ReactNode } from 'react';

import { cn } from '@/shared/lib/ClassNames/ClassNames';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button: FC<ButtonProps> = ({
  leftIcon,
  rightIcon,
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={cn('flex items-center justify-center', className)}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};

export default Button;
