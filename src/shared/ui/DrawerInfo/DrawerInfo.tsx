import { FC, PropsWithChildren, ReactNode } from 'react';

import { useModal } from '@/shared/hooks/useModal';
import Drawer from '@/shared/ui/Drawer/Drawer';

interface DrawerInfoProps extends PropsWithChildren {
  content: ReactNode;

  className?: string;
}

const DrawerInfo: FC<DrawerInfoProps> = ({ content, children, className }) => {
  const { isOpen, onOpenModal, onCloseModal } = useModal();

  return (
    <>
      <div
        className={className}
        onClick={onOpenModal}
      >
        {children}
      </div>
      <Drawer
        isOpen={isOpen}
        onClose={onCloseModal}
      >
        {content}
      </Drawer>
    </>
  );
};

export default DrawerInfo;
