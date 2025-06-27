import { ComponentType, SVGProps, useEffect, useState } from 'react';

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

  if (!SvgComponent) return null;

  return (
    <SvgComponent
      className={`fill-current ${className || ''}`}
      style={{ color: color ? `var(--${color})` : undefined }}
      {...props}
    />
  );
};

export default Icon;
