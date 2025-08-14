import { memo, PropsWithChildren, useCallback, useEffect } from 'react';

import Portal from '@/components/Portal/Portal';
import { cn } from '@/shared/lib/classNames/classNames';
import {
  AnimationProvider,
  useAnimationLibs
} from '@/shared/ui/AnimationProvider/AnimationProvider';

interface DrawerProps extends PropsWithChildren {
  className?: string;
  lazy?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  isOverlay?: boolean;
}

const DrawerContent = memo(
  ({ className, children, onClose, isOpen, isOverlay = true }: DrawerProps) => {
    const height = window.innerHeight - 100;

    const { Spring, Gesture } = useAnimationLibs();

    const [{ y }, api] = Spring.useSpring(() => ({ y: height }));

    const openDrawer = useCallback(() => api.start({ y: 0 }), [api]);

    useEffect(() => {
      if (isOpen) {
        openDrawer();

        document.body.classList.add('disable-scroll-vertical');
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
        if (my < -70) cancel();

        if (last) {
          if (my > height * 0.5 || (vy > 0.5 && dy > 0)) {
            close();
          } else {
            openDrawer();
          }
        } else {
          api.start({ y: my, immediate: true });
        }
      },
      {
        from: () => [0, y.get()],
        filterTaps: true,
        bounds: { top: 0 },
        rubberband: true
      }
    );

    if (!isOpen) return null;

    return (
      <Portal element={document.getElementById('drawer') ?? document.body}>
        <div
          className={cn(
            'fixed inset-0 z-10 flex items-end overflow-hidden md:hidden',
            className
          )}
        >
          <div
            className={cn(
              'bg-secondary-26 pointer-events-auto fixed inset-0 backdrop-blur-lg',
              {
                'bg-transparent backdrop-blur-none': !isOverlay
              }
            )}
            onClick={() => close()}
          />
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-expect-error*/}
          <Spring.a.div
            {...bind()}
            className='bg-card-content pointer-events-auto fixed z-50 w-full touch-none rounded-t-3xl px-5 pt-10 pb-5 will-change-transform'
            style={{ transform: y.to((py) => `translateY(${py}px)`) }}
            onClick={(e: any) => e.stopPropagation()}
            onMouseDown={(e: any) => e.stopPropagation()}
            onTouchStart={(e: any) => e.stopPropagation()}
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
