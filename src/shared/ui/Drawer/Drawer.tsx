import {
  memo,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
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
  ({
    className,
    children,
    onClose,
    isOpen = false,
    isOverlay = true
  }: DrawerProps) => {
    const { Spring, Gesture } = useAnimationLibs();

    const DURATION = 280;
    const EASE = Spring.easings.easeOutCubic;

    const [{ y }, api] = Spring.useSpring(() => ({ y: 0 }));

    const panelRef = useRef<HTMLDivElement | null>(null);
    const panelHeightRef = useRef(0);

    const [mounted, setMounted] = useState(isOpen);
    const [measured, setMeasured] = useState(false);
    const closingRef = useRef(false);

    const measurePanel = useCallback(() => {
      const el = panelRef.current;

      if (!el) return;

      const h = Math.max(1, el.getBoundingClientRect().height);

      panelHeightRef.current = h;

      api.start({ y: h, immediate: true });

      setMeasured(true);
    }, [api]);

    const animateOpen = useCallback(() => {
      closingRef.current = false;

      api.start({ y: 0, config: { duration: DURATION, easing: EASE } });
    }, [api]);

    const animateClose = useCallback(
      (notify = false) => {
        if (closingRef.current) return;

        closingRef.current = true;

        const h = panelHeightRef.current || 1;

        api.start({
          y: h,
          config: { duration: DURATION, easing: EASE },
          onResolve: () => {
            setMounted(false);
            document.body.classList.remove('disable-scroll-vertical');
            if (notify) onClose?.();
            closingRef.current = false;
          }
        });
      },
      [api, onClose]
    );

    useEffect(() => {
      if (isOpen) {
        setMounted(true);
      } else if (mounted) {
        animateClose(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
      if (!mounted) return;

      setMeasured(false);

      const raf = requestAnimationFrame(() => {
        measurePanel();

        const raf2 = requestAnimationFrame(() => {
          animateOpen();

          document.body.classList.add('disable-scroll-vertical');
        });

        return () => cancelAnimationFrame(raf2);
      });

      return () => cancelAnimationFrame(raf);
    }, [mounted, measurePanel, animateOpen]);

    const bind = Gesture.useDrag(
      ({
        last,
        velocity: [, vy],
        direction: [, dy],
        movement: [, my],
        cancel
      }) => {
        if (my < -70) cancel();

        const h = panelHeightRef.current || 1;

        if (last) {
          const shouldClose = my > h * 0.4 || (vy > 0.5 && dy > 0);

          if (shouldClose) animateClose(true);
          else animateOpen();
        } else {
          const next = Math.min(Math.max(my, 0), h);

          api.start({ y: next, immediate: true });
        }
      },
      {
        from: () => [0, y.get()],
        filterTaps: true,
        bounds: { top: 0 },
        rubberband: true,
        axis: 'y',
        threshold: 12,
        eventOptions: { passive: false }
      }
    );

    if (!mounted) return null;

    const overlayOpacity = y.to((py) => {
      const h = panelHeightRef.current || 1;

      const t = Math.max(0, Math.min(py / h, 1));

      return 1 - t;
    });

    return (
      <Portal element={document.getElementById('drawer') ?? document.body}>
        <div
          className={cn(
            'fixed inset-0 z-10 flex items-end overflow-hidden lg:hidden',
            className
          )}
        >
          <Spring.a.div
            className={cn(
              'bg-secondary-30 pointer-events-auto fixed inset-0 backdrop-blur-lg',
              { 'backdrop-blur-xs': !isOverlay }
            )}
            style={{
              opacity: overlayOpacity,
              pointerEvents: overlayOpacity.to((o) =>
                o > 0.01 ? 'auto' : 'none'
              )
            }}
            onClick={() => animateClose(true)}
          />
          <Spring.a.div
            {...bind()}
            ref={panelRef}
            className='bg-card-content pointer-events-auto fixed right-0 bottom-0 left-0 z-50 w-full touch-none rounded-t-3xl px-5 pt-10 pb-5 will-change-transform'
            style={{
              transform: y.to((py) => `translateY(${py}px)`),
              visibility: measured ? 'visible' : 'hidden'
            }}
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
