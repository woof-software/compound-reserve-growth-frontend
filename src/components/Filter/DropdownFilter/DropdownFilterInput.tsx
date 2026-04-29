import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { noop } from '@/shared/lib/utils/utils'
import { Dispatch, SetStateAction } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import Text from '@/shared/ui/Text/Text';

export interface DropdownFilterInputProps {
  searchValue: string
  setSearchValue?: Dispatch<SetStateAction<string>>
  isError?: boolean
}

export const DropdownFilterInput = (props: DropdownFilterInputProps) => {
  const {searchValue, setSearchValue = noop, isError} = props;

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  return (
    <>
      <div
        className={cn(
          'outline-secondary-19 m-2 flex h-10 justify-center rounded-lg py-2.5 pr-5 pl-3 outline',
          {
            'outline-red-11': !isError,
            'm-0': isMobile
          }
        )}
      >
        <input
          className='placeholder:text-secondary-21 h-[19px] w-full placeholder:text-[12px] placeholder:font-medium focus-visible:outline-none'
          placeholder='Search'
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
      {searchValue && !isError && (
        <Text
          size='11'
          className={cn('text-red-11 p-[0_8px_8px_8px] font-medium', {
            'text-[12px] font-normal mt-3 p-0': isMobile
          })}
        >
          No results found
        </Text>
      )}
    </>
  );
};