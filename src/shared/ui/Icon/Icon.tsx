import { ComponentType, SVGProps, useEffect, useState } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';

const Icon = ({
  name,
  className,
  color,
  ...props
}: {
  name: string;
  className?: string;
  color?: string;
} & SVGProps<SVGSVGElement>) => {
  const [SvgComponent, setSvgComponent] = useState<ComponentType<
    SVGProps<SVGSVGElement>
  > | null>(null);

  useEffect(() => {
    import(`@/assets/svg/${name}.svg`)
      .then((module) => {
        setSvgComponent(() => module.default);
      })
      .catch(() => {
        import('@/assets/svg/not-found-icon.svg').then((module) => {
          setSvgComponent(() => module.default);
        });
      });
  }, [name]);

  if (!SvgComponent) return <div className={cn('h-8 w-8', className)} />;

  return (
    <SvgComponent
      className={cn('fill-current', className)}
      style={{ color: color ? `var(--${color})` : undefined }}
      {...props}
    />
  );
};

export default Icon;
