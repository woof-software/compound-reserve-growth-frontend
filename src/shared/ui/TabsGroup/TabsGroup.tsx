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
  disabledTabs?: T[];
}

const TabsGroup = <T extends string = string>({
  tabs,
  defaultTab,
  value,
  onTabChange,
  className,
  disabled,
  disabledTabs
}: TabsGroupProps<T>) => {
  const internalValue = value === null ? '' : value;
  const disabledSet = new Set(disabledTabs);

  return (
    <Tabs
      value={internalValue}
      defaultValue={defaultTab || tabs[0]}
      onValueChange={(a) => {
        const nextValue = a as T;
        if (disabledSet.has(nextValue)) return;
        onTabChange?.(nextValue);
      }}
      className={cn(className?.container, {
        'pointer-events-none': disabled
      })}
    >
      <TabsList
        className={cn(
          'h-[44px] lg:h-8 w-fit rounded-lg px-1 py-0',
          'bg-primary-18 flex gap-[2px] border-none',
          className?.list
        )}
      >
        <Each
          data={tabs}
          render={(tab) => {
            const isTabDisabled = disabledSet.has(tab);
            return (
              <TabsTrigger
                key={tab}
                value={tab}
                disabled={isTabDisabled}
                className={cn(
                  'hover:bg-card-content flex cursor-pointer items-center justify-center rounded-sm px-5 lg:px-3 py-1 text-[11px] font-medium transition-opacity hover:opacity-70',
                  'h-[35px] lg:h-[24px] leading-6',
                  'text-primary-11',
                  'data-[state=active]:bg-card-content',
                  'data-[state=active]:text-primary-11',
                  'border-none',
                  className?.trigger,
                  className?.activeTrigger &&
                    `data-[state=active]:${className?.activeTrigger}`,
                  {
                    'shadow-13': value === tab,
                    'cursor-not-allowed opacity-40 hover:bg-transparent hover:opacity-40':
                      isTabDisabled
                  }
                )}
              >
                {tab}
              </TabsTrigger>
            );
          }}
        />
      </TabsList>
    </Tabs>
  );
};

export default TabsGroup;
