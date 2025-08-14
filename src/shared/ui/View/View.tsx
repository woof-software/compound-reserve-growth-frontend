import type { PropsWithChildren } from 'react';

type ConditionProps = PropsWithChildren<{
  if: boolean;
}>;

const Condition = ({ if: condition, children }: ConditionProps) => {
  if (condition) {
    return <>{children}</>;
  }

  return null;
};

const Desktop = ({ children }: PropsWithChildren) => {
  return <div className='hidden lg:block'>{children}</div>;
};

const Tablet = ({ children }: PropsWithChildren) => {
  return <div className='hidden md:block'>{children}</div>;
};

const Mobile = ({ children }: PropsWithChildren) => {
  return <div className='block md:hidden'>{children}</div>;
};

const View = {
  Condition,
  Desktop,
  Tablet,
  Mobile
};

export default View;
