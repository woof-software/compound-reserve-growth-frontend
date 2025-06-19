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

const View = {
  Condition
};

export default View;
