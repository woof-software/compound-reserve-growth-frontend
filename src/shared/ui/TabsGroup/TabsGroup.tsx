import { cn } from '@/shared/lib/classNames/classNames';

import { Tabs, TabsList, TabsTrigger } from '../Tabs/Tabs';

interface TabsGroupProps {
  tabs: string[];

  defaultTab?: string;

  value?: string | null;

  onTabChange?: (value: string) => void;

  className?: {
    container?: string;

    list?: string;

    trigger?: string;

    activeTrigger?: string;
  };
  disabled?: boolean;
}

const TabsGroup = ({
  tabs,
  defaultTab,
  value,
  onTabChange,
  className,
  disabled
}: TabsGroupProps) => {
  const internalValue = value === null ? '' : value;

  return (
    <Tabs
      value={internalValue}
      defaultValue={defaultTab || tabs[0]}
      onValueChange={onTabChange}
      className={cn(className?.container, { 'pointer-events-none': disabled })}
    >
      <TabsList
        className={cn(
          'h-10 w-fit rounded-full p-1 lg:h-8',
          'bg-primary-18 dark:shadow-13 shadow-14 border-none',
          className?.list
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className={cn(
              'hover:bg-card-content flex cursor-pointer items-center justify-center rounded-full px-3 py-1 text-sm transition-opacity hover:opacity-70 md:text-[11px]',
              'h-8 leading-6 lg:h-6',
              'text-primary-11',
              'data-[state=active]:bg-card-content',
              'data-[state=active]:text-primary-11',
              'data-[state=active]:shadow-sm',
              'data-[state=active]:!dark:shadow-13',
              'data-[state=active]:!shadow-14',
              'border-none',
              className?.trigger,
              className?.activeTrigger &&
                `data-[state=active]:${className?.activeTrigger}`
            )}
          >
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default TabsGroup;
