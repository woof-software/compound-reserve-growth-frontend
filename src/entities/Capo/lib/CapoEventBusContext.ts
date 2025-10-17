import { EventBusContext } from '@/shared/contexts/EventBusContext';

export type CapoEventBusEvents = {
  /**
   * Event has to be used to trigger filters update of the Specific Collateral Price against Price Restriction block.
   *
   * Ex.
   * - Trigger filters change on click by the table row
   *
   * Payload:
   * @property network - Value existing inside of the `Chain` filter.
   * @property collateral - Value existing inside of the `Chain` filter.
   */
  'on-collateral-select': { network: string; collateral: string };
};

/**
 * CapoEventBusEventsContext is a specialized EventBus context instance
 * used for managing event-driven communication specifically for CAPO page.
 *
 * It is created by spawning a new context from the EventBusContext
 * and it provides the functionality to publish, subscribe, and manage
 * events within CAPO page scope.
 */
export const CapoEventBusEventsContext =
  EventBusContext.spawn<CapoEventBusEvents>();
