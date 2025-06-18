import { ComponentProps, FC, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { cn } from '@/shared/lib/ClassNames/ClassNames';

export interface LinkProps extends ComponentProps<typeof RouterLink> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Link: FC<LinkProps> = ({
  leftIcon,
  rightIcon,
  children,
  className,
  ...props
}) => {
  return (
    <RouterLink
      className={cn('flex items-center no-underline', className)}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </RouterLink>
  );
};

export default Link;
