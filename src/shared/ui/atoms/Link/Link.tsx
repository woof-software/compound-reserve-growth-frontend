import { ComponentProps, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { cn } from '@/shared/lib/classNames';

interface LinkProps extends ComponentProps<typeof RouterLink> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Link = ({
  leftIcon,
  rightIcon,
  children,
  className,
  to,
  ...props
}: LinkProps) => {
  if (typeof to === 'string' && (to.startsWith('#') || to.startsWith('http'))) {
    return (
      <a
        href={to}
        className={cn('flex items-center no-underline', className)}
        {...(props as ComponentProps<'a'>)}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </a>
    );
  }

  return (
    <RouterLink
      to={to}
      className={cn('flex items-center no-underline', className)}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </RouterLink>
  );
};

export { Link };
