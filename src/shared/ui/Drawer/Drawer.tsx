import { PropsWithChildren, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@/shared/lib/classNames/classNames';
import { noop } from '@/shared/lib/utils/utils';

interface DrawerProps extends PropsWithChildren {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

interface DragInfo {
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
}

const CLOSE_THRESHOLD = 0;
const VELOCITY_THRESHOLD = 500;

const EASE_OPEN = [0.33, 1, 0.68, 1] as const;
const EASE_CLOSE = [0.32, 0, 0.67, 0] as const;

const Drawer = (props: DrawerProps) => {
  const { className, children, onClose = noop, isOpen = false } = props;

  const panelRef = useRef<HTMLDivElement>(null);

  const handleDragEnd =
    (_: MouseEvent | TouchEvent | PointerEvent, info: DragInfo  ) => {
      const panelHeight = panelRef.current?.getBoundingClientRect().height ?? 1;
      const shouldClose =
        info.offset.y > panelHeight * CLOSE_THRESHOLD ||
        (info.velocity.y > VELOCITY_THRESHOLD && info.offset.y > 0);

      if (shouldClose) {
        onClose();
      }
    };

  useEffect(() => {
    document.body.classList.toggle('disable-scroll-vertical', isOpen);
    return () => document.body.classList.remove('disable-scroll-vertical');
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-10 flex items-end overflow-hidden lg:hidden',
            className
          )}
        >
          <div
            className='bg-secondary-30 fixed inset-0 backdrop-blur-lg'
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            drag='y'
            dragConstraints={{top: 0}}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={handleDragEnd}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%', transition: { duration: 0.15, ease: EASE_CLOSE } }}
            transition={{ duration: 0.25, ease: EASE_OPEN }}
            className='bg-card-content fixed right-0 bottom-0 left-0 z-50 w-full touch-none rounded-t-3xl px-5 pt-10 pb-5 will-change-transform'
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Drawer;