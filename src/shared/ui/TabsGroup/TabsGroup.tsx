import { cn } from '@/shared/lib/classNames/classNames';
import Each from '@/shared/ui/Each/Each';

import { Tabs, TabsList, TabsTrigger } from '../Tabs/Tabs';

interface TabsGroupProps<T extends string = string> {
  tabs: T[];
  defaultTab?: T;
  value?: T | null;
  onTabChange?: (value: T) => void;
  className?: {
    container?: string;
    list?: string;
    trigger?: string;
    activeTrigger?: string;
  };
  disabled?: boolean;
}

const TabsGroup = <T extends string = string>({
  tabs,
  defaultTab,
  value,
  onTabChange,
  className,
  disabled
}: TabsGroupProps<T>) => {
  const internalValue = value === null ? '' : value;

  return (
    <Tabs
      value={internalValue}
      defaultValue={defaultTab || tabs[0]}
      onValueChange={(a) => onTabChange?.(a as T)}
      className={cn(className?.container, {
        'pointer-events-none': disabled
      })}
    >
      <TabsList
        className={cn(
          'h-9 w-fit rounded-lg p-1 md:h-8',
          'bg-primary-18 dark:shadow-13 shadow-14 border-none',
          className?.list
        )}
      >
        <Each
          data={tabs}
          render={(tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={cn(
                'hover:bg-card-content flex cursor-pointer items-center justify-center rounded-sm px-3 py-1 text-[11px] font-medium transition-opacity hover:opacity-70',
                'h-7 leading-6 md:h-6',
                'text-primary-11',
                'data-[state=active]:bg-card-content',
                'data-[state=active]:text-primary-11',
                'border-none',
                className?.trigger,
                className?.activeTrigger &&
                  `data-[state=active]:${className?.activeTrigger}`,
                {
                  '!shadow-13': value === tab
                }
              )}
            >
              {tab}
            </TabsTrigger>
          )}
        />
      </TabsList>
    </Tabs>
  );
};

export default TabsGroup;
