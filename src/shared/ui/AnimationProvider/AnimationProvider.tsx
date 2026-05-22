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

const AnimationContext = createContext<AnimationContextPayload>({
  Gesture: undefined,
  Spring: undefined,
  isLoaded: false
});

const getAsyncAnimationModules = async () =>
  Promise.all([import('@react-spring/web'), import('@use-gesture/react')]);

const useAnimationLibs = () =>
  useContext(AnimationContext) as Required<AnimationContextPayload>;

const AnimationProvider = ({ children }: { children: ReactNode }) => {
  const SpringRef = useRef<SpringType | undefined>(undefined);
  const GestureRef = useRef<GestureType | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getAsyncAnimationModules().then(([Spring, Gesture]) => {
      SpringRef.current = Spring;
      GestureRef.current = Gesture;
      setIsLoaded(true);
    });
  }, []);

  const value = useMemo(
    () => ({
      Gesture: GestureRef.current,
      Spring: SpringRef.current,
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
