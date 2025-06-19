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
          'h-12 w-fit rounded-full bg-[#f1f2f6] p-1',
          'border border-gray-200',
          listClassName
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className={cn(
              'rounded-full px-6 py-2 text-base font-medium transition-all duration-200',
              'text-gray-700',
              'hover:text-gray-900',
              'h-10 min-w-[60px]',
              'data-[state=active]:bg-white',
              'data-[state=active]:text-gray-900',
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
