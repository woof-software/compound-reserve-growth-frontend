// import React from 'react';

// import Text from '@/shared/ui/Text/Text';

// import HoverCard from '../HoverCard/HoverCard';

// interface AddressTooltipProps {
//   text: string;
//   side?: 'top' | 'bottom' | 'left' | 'right';
//   triggerWidth?: number;
//   className?: string;
//   url?: string;
// }

// export const UrlTooltip: React.FC<AddressTooltipProps> = ({
//   text,
//   side = 'top',
//   triggerWidth = 120,
//   className = '',
//   url
// }) => {
//   const triggerContent = (
//     <div
//       className={`flex items-start ${className}`}
//       style={{ width: `${triggerWidth}px` }}
//     >
//       <Text
//         size='13'
//         className='text-primary-11 inline-block max-w-full cursor-pointer truncate border-b border-dotted border-gray-500 leading-none'
//       >
//         {text}
//       </Text>
//     </div>
//   );

//   const tooltipContent = (
//     <div className='flex w-50 flex-col items-start gap-2'>
//       <Text
//         size='12'
//         className='text-primary-11'
//       >
//         {text}
//       </Text>
//       {url && (
//         <a
//           href={url}
//           target='_blank'
//           rel='noopener noreferrer'
//           className='text-[14px] text-blue-500 underline hover:text-blue-700'
//         >
//           View Details
//         </a>
//       )}
//     </div>
//   );

//   return (
//     <HoverCard
//       content={tooltipContent}
//       side={side}
//     >
//       {triggerContent}
//     </HoverCard>
//   );
// };

import React from 'react';

import Text from '@/shared/ui/Text/Text';

import HoverCard from '../HoverCard/HoverCard';

interface AddressTooltipProps {
  text: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  triggerWidth?: number;
  className?: string;
  url?: string;
  tooltipClassName?: string;
  contentWidth?: string;
}

export const UrlTooltip: React.FC<AddressTooltipProps> = ({
  text,
  side = 'top',
  triggerWidth = 120,
  className = '',
  url,
  tooltipClassName = '',
  contentWidth = 'w-40'
}) => {
  const triggerContent = (
    <div
      className={`flex items-start ${className}`}
      style={{ width: `${triggerWidth}px` }}
    >
      <Text
        size='13'
        className='text-primary-11 inline-block max-w-full cursor-pointer truncate border-b border-dotted border-gray-500 leading-none'
      >
        {text}
      </Text>
    </div>
  );

  const tooltipContent = (
    <div className={`flex ${contentWidth} flex-col items-start gap-2`}>
      <Text
        size='12'
        className='text-primary-11'
      >
        {text}
      </Text>
      {url && (
        <a
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className='text-[14px] text-blue-500 underline hover:text-blue-700'
        >
          View Details
        </a>
      )}
    </div>
  );

  return (
    <HoverCard
      content={tooltipContent}
      side={side}
      className={tooltipClassName}
    >
      {triggerContent}
    </HoverCard>
  );
};
