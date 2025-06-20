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
          'bg-primary-10 h-12 w-fit rounded-full p-1',
          'border-primary-12 border',
          listClassName
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className={cn(
              'rounded-full px-6 py-2 text-base font-medium',
              'text-primary-13',
              'hover:text-primary-11',
              'h-10 min-w-[60px]',
              'data-[state=active]:bg-primary-15',
              'data-[state=active]:text-primary-11',
              'data-[state=active]:shadow-sm',
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
