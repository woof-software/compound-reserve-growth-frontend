import {
  memo,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState
} from 'react';

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
    const height =
      typeof window !== 'undefined' ? window.innerHeight - 100 : 600;
    const { Spring, Gesture } = useAnimationLibs();

    const [mounted, setMounted] = useState<boolean>(isOpen || false);

    const [{ y }, api] = Spring.useSpring(() => ({
      y: height,
      immediate: true
    }));

    const overlayOpacity = y.to([0, height], [1, 0]);

    const E = Spring.easings;
    const PANEL_MS = 300;

    const openAnim = useCallback(() => {
      api.set({ y: height });
      api.start({
        y: 0,
        config: { duration: PANEL_MS, easing: E.easeOutCubic }
      });
      document.body.classList.add('disable-scroll-vertical');
    }, [api, height, E]);

    const closeAnim = useCallback(
      (velocity = 0) => {
        api.start({
          y: height,
          config: { duration: PANEL_MS, easing: E.easeInCubic, velocity },
          onResolve: () => {
            document.body.classList.remove('disable-scroll-vertical');
            setMounted(false);
            onClose?.();
          }
        });
      },
      [api, height, E, onClose]
    );

    useEffect(() => {
      if (isOpen) {
        setMounted(true);
      } else if (mounted) {
        closeAnim();
      }
    }, [isOpen]);

    useEffect(() => {
      if (mounted && isOpen) {
        openAnim();
      }
    }, [mounted, isOpen, openAnim]);

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
          const passedDistance = my > Math.min(120, height * 0.33);
          const fastSwipeDown = dy > 0 && vy > 0.6 && my > 24;

          if (passedDistance || fastSwipeDown) {
            closeAnim(vy);
          } else {
            api.start({
              y: 0,
              config: { duration: PANEL_MS, easing: E.easeOutCubic }
            });
          }
        } else {
          api.start({ y: Math.max(0, my), immediate: true });
        }
      },
      {
        from: () => [0, y.get()],
        filterTaps: true,
        axis: 'y',
        threshold: 12,
        bounds: { top: 0 },
        rubberband: true,
        eventOptions: { passive: false }
      }
    );

    if (!mounted) return null;

    return (
      <Portal element={document.getElementById('drawer') ?? document.body}>
        <div
          className={cn(
            'fixed inset-0 z-10 flex items-end overflow-hidden md:hidden',
            className
          )}
        >
          <Spring.a.div
            className={cn(
              'bg-secondary-26 pointer-events-auto fixed inset-0 backdrop-blur-lg',
              { 'backdrop-blur-xs': !isOverlay }
            )}
            style={{ opacity: overlayOpacity }}
            onClick={() => closeAnim()}
          />
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
