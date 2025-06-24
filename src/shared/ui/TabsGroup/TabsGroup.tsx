import { cn } from '@/shared/lib/classNames/classNames';

import { Tabs, TabsList, TabsTrigger } from '../Tabs/Tabs';

interface TabsGroupProps {
  tabs: string[];
  defaultTab?: string;
  onTabChange?: (value: string) => void;
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
  activeTriggerClassName?: string;
}

const TabsGroup = ({
  tabs,
  defaultTab,
  onTabChange,
  className,
  listClassName,
  triggerClassName,
  activeTriggerClassName
}: TabsGroupProps) => {
  return (
    <Tabs
      defaultValue={defaultTab || tabs[0]}
      onValueChange={onTabChange}
      className={className}
    >
      <TabsList
        className={cn(
          'h-8 w-fit rounded-full p-1',
          'border-primary-17 border-[0.25px]',
          'bg-card-header',
          listClassName
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className={cn(
              'cursor-pointer rounded-full px-3 py-1 text-[11px] font-medium',
              'h-6',
              'text-primary-11',
              'data-[state=active]:bg-card-content',
              'data-[state=active]:text-primary-11',
              'data-[state=active]:shadow-sm',
              'data-[state=active]:border-primary-17',
              'data-[state=active]:border-[0.25px]',
              'border-[0.25px] border-transparent',
              triggerClassName,
              activeTriggerClassName &&
                `data-[state=active]:${activeTriggerClassName}`
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
