import { FC, ReactNode, useMemo } from 'react';

import { useClipboard } from '@/shared/hooks/useClipboard';
import { cn } from '@/shared/lib/classNames/classNames';
import { useSearchParams } from 'react-router-dom';

import Icon from '../Icon/Icon';
import Text from '../Text/Text';
import View from '../View/View';

interface CardProps {
  title?: string;
  id?: string;
  isLoading?: boolean;
  isError?: boolean;
  children: ReactNode;
  className?: {
    loading?: string;
    error?: string;
    container?: string;
    header?: string;
    content?: string;
    title?: string;
  };
}

const Card: FC<CardProps> = ({
  title,
  isLoading,
  isError,
  children,
  className,
  id
}) => {
  const [isCopied, copy] = useClipboard();
  const [searchParams] = useSearchParams();

  const showPlaceholder = isLoading || isError;

  const blockId = useMemo(() => {
    if (!id) return Math.random().toString();

    return id?.toLowerCase().split(' ').join('-');
  }, [id]);

  const onCopyLink = (id: string) => {
    if (!id) return;

    const link =
      `${window.location.origin}${window.location.pathname}` +
      `${searchParams.size ? '?' + searchParams : ''}` +
      `#${id}`;

    copy(link);
  };

  return (
    <div
      id={blockId}
      className={cn(
        'bg-card-content w-full overflow-hidden rounded-sm shadow-md md:rounded-lg',
        {
          'justify-center': isLoading
        },
        className?.container
      )}
    >
      <View.Condition if={Boolean(showPlaceholder)}>
        <div
          className={cn(
            'flex h-full items-center justify-center',
            className?.loading
          )}
        >
          <Text
            size='11'
            weight='500'
            lineHeight='16'
            className={cn('text-primary-14', isError && 'text-red-500')}
          >
            {isError ? 'error loading data' : 'Loading...'}
          </Text>
        </div>
      </View.Condition>
      <View.Condition if={!isLoading && !isError}>
        <View.Condition if={Boolean(title)}>
          <div
            className={cn(
              'bg-card-header flex items-center gap-3 px-5 py-4 md:px-10 md:py-4',
              className?.header
            )}
          >
            <Text
              tag='h3'
              size='13'
              weight='500'
              lineHeight='27'
              className={cn(className?.title)}
            >
              {title}
            </Text>
            <div className='flex h-6 w-6 cursor-pointer items-center justify-center'>
              <View.Condition if={Boolean(id)}>
                <View.Condition if={isCopied}>
                  <Icon
                    name='сheck-сopy-icon'
                    className='text-green-500'
                  />
                </View.Condition>
                <View.Condition if={!isCopied}>
                  <Icon
                    name='link'
                    color='primary-14'
                    onClick={() => onCopyLink?.(blockId)}
                  />
                </View.Condition>
              </View.Condition>
            </div>
          </div>
        </View.Condition>
        <div className={cn('bg-card-content p-10', className?.content)}>
          {children}
        </div>
      </View.Condition>
    </div>
  );
};

export default Card;
