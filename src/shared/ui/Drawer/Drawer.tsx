// src/shared/ui/Drawer/Drawer.tsx
import { memo, PropsWithChildren, useCallback, useEffect } from 'react';

import Portal from '@/components/Portal/Portal';
import { cn } from '@/shared/lib/classNames/classNames';
import {
  AnimationProvider,
  useAnimationLibs
} from '@/shared/ui/AnimationProvider/AnimationProvider';

interface DrawerProps extends PropsWithChildren {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const DrawerContent = memo(
  ({ className, children, isOpen, onClose }: DrawerProps) => {
    const height = window.innerHeight - 100;
    const { Spring, Gesture } = useAnimationLibs();
    const [{ y }, api] = Spring.useSpring(() => ({ y: height }));
    const openDrawer = useCallback(() => api.start({ y: 0 }), [api]);

    useEffect(() => {
      if (isOpen) {
        openDrawer();
        document.body.classList.add('disable-scroll-vertical');
      } else {
        document.body.classList.remove('disable-scroll-vertical');
      }
      return () => document.body.classList.remove('disable-scroll-vertical');
    }, [isOpen, openDrawer]);

    const close = (velocity = 0) => {
      api.start({
        y: height,
        config: { ...Spring.config.stiff, velocity },
        onResolve: onClose
      });
    };

    const bind = Gesture.useDrag(
      ({
        last,
        velocity: [, vy],
        direction: [, dy],
        movement: [, my],
        cancel
      }) => {
        if (my < -70) {
          cancel();
        }
        if (last) {
          if (my > height * 0.5 || (vy > 0.5 && dy > 0)) {
            close(vy);
          } else {
            openDrawer();
          }
        } else {
          api.start({ y: my, immediate: true });
        }
      },
      { from: () => [0, y.get()], bounds: { top: 0 }, rubberband: true }
    );

    if (!isOpen) return null;
    const display = y.to((py) => (py < height ? 'block' : 'none'));

    return (
      <Portal element={document.getElementById('drawer') ?? document.body}>
        <div
          className={cn(
            'pointer-events-none fixed inset-0 z-10 flex items-end overflow-hidden',
            className
          )}
        >
          <div
            className='bg-secondary-26 pointer-events-auto fixed inset-0 backdrop-blur-lg'
            onClick={() => close()}
          />
          <Spring.a.div
            {...bind()}
            style={{ display, y }}
            className='pointer-events-auto fixed inset-x-0 bottom-0 z-[3] mx-auto min-h-[290px] max-w-[750px] rounded-t-3xl bg-white px-5 py-10 shadow-lg'
            onTouchStart={(e) => e.stopPropagation()}
          >
            {children}
          </Spring.a.div>
        </div>
      </Portal>
    );
  }
);

const DrawerAsync = (props: DrawerProps) => {
  const { isLoaded } = useAnimationLibs();
  if (!isLoaded) return null;
  return <DrawerContent {...props} />;
};

const Drawer = (props: DrawerProps) => (
  <AnimationProvider>
    <DrawerAsync {...props} />
  </AnimationProvider>
);

export default Drawer;
