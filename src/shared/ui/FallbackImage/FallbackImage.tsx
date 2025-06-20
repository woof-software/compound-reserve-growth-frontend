import { FC, ImgHTMLAttributes, useEffect, useState } from 'react';

interface FallbackImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallbackSrc?: string;
}

const FallbackImage: FC<FallbackImageProps> = ({
  src: initialSrc,
  fallbackSrc = 'src/assets/not-found-icon.svg',
  width = 24,
  height = 24,
  alt,
  style,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(initialSrc);

  useEffect(() => {
    setCurrentSrc(initialSrc);
  }, [initialSrc]);

  return (
    <img
      width={width}
      height={height}
      src={`src/assets/${currentSrc}`}
      alt={alt || 'Fallback image'}
      onError={() => setCurrentSrc(fallbackSrc)}
      style={{
        objectFit: 'contain',
        display: 'block',
        minWidth: `${width}px`,
        maxWidth: `${width}px`,
        minHeight: `${height}px`,
        maxHeight: `${height}px`,
        ...style
      }}
      {...props}
    />
  );
};

export default FallbackImage;
