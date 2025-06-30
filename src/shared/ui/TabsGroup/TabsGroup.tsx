import { cn } from '@/shared/lib/classNames/classNames';

import { Tabs, TabsList, TabsTrigger } from '../Tabs/Tabs';

interface TabsGroupProps {
  tabs: string[];

  defaultTab?: string;

  value?: string;

  onTabChange?: (value: string) => void;

  className?: {
    container?: string;

    list?: string;

    trigger?: string;

    activeTrigger?: string;
  };
}

const TabsGroup = ({
  tabs,
  defaultTab,
  value,
  onTabChange,
  className
}: TabsGroupProps) => {
  return (
    <Tabs
      value={value}
      defaultValue={defaultTab || tabs[0]}
      onValueChange={onTabChange}
      className={className?.container}
    >
      <TabsList
        className={cn(
          'h-8 w-fit rounded-full p-1',
          'bg-primary-18 dark:shadow-13 shadow-14 border-none',
          className?.list
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className={cn(
              'hover:bg-card-content flex cursor-pointer items-center justify-center rounded-full px-3 py-1 text-[11px] transition-opacity hover:opacity-70',
              'h-6 leading-6',
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
