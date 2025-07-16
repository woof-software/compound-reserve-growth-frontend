import { ComponentType, SVGProps, useEffect, useState } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';

type IconFolder = 'token' | 'collaterals' | 'network';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
  color?: string;
  folder?: IconFolder;
}

const Icon = ({ name, className, color, folder, ...props }: IconProps) => {
  const [SvgComponent, setSvgComponent] = useState<ComponentType<
    SVGProps<SVGSVGElement>
  > | null>(null);

  useEffect(() => {
    setSvgComponent(null);

    let importPromise;

    if (folder === 'token') {
      importPromise = import(`@/assets/svg/token/${name}.svg`);
    } else if (folder === 'collaterals') {
      importPromise = import(`@/assets/svg/collaterals/${name}.svg`);
    } else if (folder === 'network') {
      importPromise = import(`@/assets/svg/network/${name}.svg`);
    } else {
      importPromise = import(`@/assets/svg/${name}.svg`);
    }

    importPromise
      .then((module) => {
        if (module && module.default) {
          setSvgComponent(() => module.default);
        } else {
          throw new Error('Module or default export not found');
        }
      })
      .catch(() => {
        import('@/assets/svg/not-found-icon.svg').then((module) => {
          setSvgComponent(() => module.default);
        });
      });
  }, [name, folder]);

  if (!SvgComponent) {
    return (
      <div
        className={cn('h-8 w-8 rounded-full', className)}
        style={{ opacity: 0 }}
      />
    );
  }

  return (
    <SvgComponent
      className={cn('rounded-full fill-current', className)}
      style={{ color: color ? `var(--${color})` : undefined }}
      {...props}
    />
  );
};

export default Icon;
