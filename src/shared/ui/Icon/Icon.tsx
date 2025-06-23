import { useEffect, useState } from 'react';

const Icon = ({
  name,
  className,
  color,
  ...props
}: {
  name: string;
  className?: string;
  color?: string;
} & React.SVGProps<SVGSVGElement>) => {
  const [SvgComponent, setSvgComponent] = useState<React.ComponentType<
    React.SVGProps<SVGSVGElement>
  > | null>(null);

  useEffect(() => {
    import(`@/assets/svg/${name}.svg`).then((module) => {
      setSvgComponent(() => module.default);
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
