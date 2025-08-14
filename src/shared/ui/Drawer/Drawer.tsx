import React, { memo, PropsWithChildren, useCallback, useEffect } from 'react';

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
  ({ className, children, onClose, isOpen }: DrawerProps) => {
    const height = window.innerHeight - 100;

    const { Spring, Gesture } = useAnimationLibs();

    const [{ y }, api] = Spring.useSpring(() => ({
      y: height,
      immediate: true
    }));

    const [contentStyles, contentApi] = Spring.useSpring(() => ({
      opacity: 0,
      ty: 16
    }));

    const overlayOpacity = y.to([0, height], [1, 0]);

    const EasingDictionary = Spring.easings;
    const PANEL_MS = 300;
    const CONTENT_MS = 240;
    const STAGGER = 50;

    const openDrawer = useCallback(() => {
      api.set({ y: height });

      api.start({
        y: 0,
        config: { duration: PANEL_MS, easing: EasingDictionary.easeOutCubic }
      });

      contentApi.start({
        opacity: 1,
        ty: 0,
        delay: STAGGER,
        config: { duration: CONTENT_MS, easing: EasingDictionary.easeOutCubic }
      });
    }, [api, height, EasingDictionary.easeOutCubic, contentApi]);

    useEffect(() => {
      if (isOpen) {
        openDrawer();
        document.body.classList.add('disable-scroll-vertical');
      } else {
        document.body.classList.remove('disable-scroll-vertical');
      }
      return () => document.body.classList.remove('disable-scroll-vertical');
    }, [isOpen, openDrawer]);

    const close = () => {
      contentApi.start({
        opacity: 0,
        ty: 8,
        config: { duration: CONTENT_MS, easing: EasingDictionary.easeInCubic }
      });

      api.start({
        y: height,
        config: { duration: PANEL_MS, easing: EasingDictionary.easeInCubic },
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
          const passedDistance = my > Math.min(120, height * 0.33);
          const fastSwipeDown = dy > 0 && vy > 0.6 && my > 24;

          if (passedDistance || fastSwipeDown) {
            contentApi.start({
              opacity: 0,
              ty: 6,
              config: { duration: 120, easing: EasingDictionary.easeInCubic }
            });
            api.start({
              y: height,
              config: { tension: 220, friction: 26, velocity: vy },
              onResolve: onClose
            });
          } else {
            api.start({
              y: 0,
              config: {
                duration: PANEL_MS,
                easing: EasingDictionary.easeOutCubic
              }
            });
            contentApi.start({
              opacity: 1,
              ty: 0,
              config: {
                duration: CONTENT_MS,
                easing: EasingDictionary.easeOutCubic
              }
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
        rubberband: true
      }
    );

    if (!isOpen) return null;

    return (
      <Portal element={document.getElementById('drawer') ?? document.body}>
        <div
          className={cn(
            'fixed inset-0 z-50 flex items-end md:hidden',
            className
          )}
        >
          <Spring.a.div
            className='bg-secondary-26 pointer-events-auto fixed inset-0 backdrop-blur-lg'
            style={{ opacity: overlayOpacity }}
            onClick={() => close()}
          />
          <Spring.a.div
            className='bg-card-content pointer-events-auto fixed z-50 w-full touch-none rounded-t-3xl px-5 pt-10 pb-5 will-change-transform'
            style={{ transform: y.to((v) => `translateY(${v}px)`) }} // 🔹 БЕЗ display
            {...bind()}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <Spring.a.div
              style={{
                opacity: contentStyles.opacity,
                transform: contentStyles.ty.to((v) => `translateY(${v}px)`),
                willChange: 'opacity, transform'
              }}
            >
              {children}
            </Spring.a.div>
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
