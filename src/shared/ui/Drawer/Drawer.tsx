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
}

const DrawerContent = memo(
  ({ className, children, onClose, isOpen = false }: DrawerProps) => {
    const { Spring, Gesture } = useAnimationLibs();

    const DURATION_OPEN = 250;
    const DURATION_CLOSE = 150;

    const EASE_OPEN = Spring.easings.easeOutCubic;
    const EASE_CLOSE = Spring.easings.easeInCubic;

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
      setMeasured(true);
    }, []);

    const animateOpen = useCallback(() => {
      closingRef.current = false;
      const h = panelHeightRef.current || 1;

      api.start({
        from: { y: h },
        to: { y: 0 },
        config: { duration: DURATION_OPEN, easing: EASE_OPEN }
      });
    }, [api]);

    const animateClose = useCallback(
      (notify = false) => {
        if (closingRef.current) return;

        closingRef.current = true;

        const h = panelHeightRef.current || 1;

        api.start({
          y: h,
          config: { duration: DURATION_CLOSE, easing: EASE_CLOSE },
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

          if (shouldClose) {
            animateClose(true);
          } else {
            api.start({
              to: { y: 0 },
              config: { duration: DURATION_OPEN, easing: EASE_OPEN }
            });
          }
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
            className='bg-secondary-30 pointer-events-auto fixed inset-0 backdrop-blur-lg'
            style={{ opacity: overlayOpacity }}
            onClick={() => animateClose(true)}
          />
          <Spring.a.div
            {...bind()}
            ref={panelRef}
            className={cn(
              'bg-card-content pointer-events-auto fixed right-0 bottom-0 left-0 z-50 w-full touch-none rounded-t-3xl px-5 pt-10 pb-5 will-change-transform',
              isOpen ? 'animate-drawer-in' : 'animate-drawer-out'
            )}
            style={{
              transform: y.to((py) => `translateY(${py}px)`),
              visibility: measured ? 'visible' : 'hidden'
            }}
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
