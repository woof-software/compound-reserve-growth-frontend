import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

type SpringType = typeof import('@react-spring/web');
type GestureType = typeof import('@use-gesture/react');

interface AnimationContextPayload {
  Gesture?: GestureType;
  Spring?: SpringType;
  isLoaded?: boolean;
}

const AnimationContext = createContext<AnimationContextPayload>({});

const getAsyncAnimationModules = async () => {
  return Promise.all([
    import('@react-spring/web'),
    import('@use-gesture/react')
  ]);
};

const useAnimationLibs = () => {
  return useContext(AnimationContext) as Required<AnimationContextPayload>;
};

const AnimationProvider = ({ children }: { children: ReactNode }) => {
  const SpringRef = useRef<SpringType | null>(null);
  const GestureRef = useRef<GestureType | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    getAsyncAnimationModules().then(([Spring, Gesture]) => {
      SpringRef.current = Spring;
      GestureRef.current = Gesture;
      setIsLoaded(true);
    });
  }, []);

  const value = useMemo(
    () => ({
      Gesture: GestureRef.current || undefined,
      Spring: SpringRef.current || undefined,
      isLoaded
    }),
    [isLoaded]
  );

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

export { AnimationProvider, useAnimationLibs };
