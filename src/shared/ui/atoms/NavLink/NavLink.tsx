import { ComponentProps, FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/classNames';

interface NavLinkProps extends Omit<ComponentProps<typeof Link>, 'to'> {
  to: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  activeClassName?: string;
  children?: ReactNode;
  isActive?: boolean;
  className?: string;
}

const NavLink: FC<NavLinkProps> = ({
  to,
  leftIcon,
  rightIcon,
  children,
  className,
  activeClassName,
  isActive = false,
  ...props
}) => {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center no-underline transition-colors duration-200',
        className,
        isActive && activeClassName
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
};

export { NavLink };
