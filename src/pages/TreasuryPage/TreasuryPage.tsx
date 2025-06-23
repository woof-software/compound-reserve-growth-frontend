import * as React from 'react';

import TreasuryBalanceByNetwork from '@/components/TreasuryPageTable/TreasuryBalanceByNetwork';
import TreasuryComposition from '@/components/TreasuryPageTable/TreasuryComposition';
import TreasuryHoldings from '@/components/TreasuryPageTable/TreasuryHoldings';
import Card from '@/shared/ui/Card/Card';
import {
  Dropdown,
  DropdownItem,
  TriggerContent,
  useDropdown
} from '@/shared/ui/Dropdown/Dropdown';
import Each from '@/shared/ui/Each/Each';
import FallbackImage from '@/shared/ui/FallbackImage/FallbackImage';
import {
  Select,
  SelectItem,
  SelectTriggerContent,
  useSelect
} from '@/shared/ui/Select/Select';
import Switch from '@/shared/ui/Switch/Switch';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';
import ValueMetricField from '@/shared/ui/ValueMetricField/ValueMetricField';

const TreasuryPage = () => {
  const options = ['ETH', 'DAI', 'USDC', 'WBTC'];

  const {
    open: openSingle,
    selectedValue: selectedSingle,
    toggle: toggleSingle,
    close: closeSingle,
    select: selectSingle
  } = useDropdown('single');

  // multi-select
  const {
    open: openMulti,
    selectedValue: selectedMulti,
    toggle: toggleMulti,
    close: closeMulti,
    select: selectMulti
  } = useDropdown('multiple');

  const {
    open: openSelect,
    selectedValue: selectedValueMulti,
    toggle: toggleSelectMulti,
    close: closeSelectMulti,
    select: selectValueMulti,
    deleteItem: deleteItemMulti
  } = useSelect('multiple');

  return (
    <div className='flex flex-col gap-[70px]'>
      <Select
        title='Chain'
        open={openSelect}
        triggerContent={
          <SelectTriggerContent
            placeholder='Add Chain'
            selectedItems={selectedValueMulti}
            onItemDelete={deleteItemMulti}
          />
        }
        onClose={closeSelectMulti}
        onToggle={toggleSelectMulti}
      >
        <Each
          data={['Ethereum', 'Arbitrum', 'Avalance', 'Bitcoin', 'Solana']}
          render={(asset, idx) => (
            <SelectItem
              key={idx}
              asset={asset}
              isSelected={selectedValueMulti.includes(asset)}
              onSelect={selectValueMulti}
            />
          )}
        />
      </Select>

      {/* ===== Single-select ===== */}
      <div>
        <Text
          tag='h2'
          size='15'
          weight='500'
        >
          Single Select
        </Text>

        <Dropdown
          open={openSingle}
          onToggle={toggleSingle}
          onClose={closeSingle}
          triggerContent={
            <TriggerContent
              title='Asset Type'
              isOpen={openSingle}
            />
          }
        >
          <Each
            data={options}
            render={(asset, idx) => (
              <DropdownItem
                key={idx}
                asset={asset}
                isSelected={selectedSingle?.[0] === asset}
                onSelect={selectSingle}
              />
            )}
          />
        </Dropdown>
        <Text
          size='11'
          className='mt-2'
        >
          Selected: {selectedSingle?.[0] ?? '—'}
        </Text>
      </div>

      {/* ===== Multiple-select ===== */}
      <div>
        <Text
          tag='h2'
          size='15'
          weight='500'
        >
          Multi Select
        </Text>

        <Dropdown
          open={openMulti}
          onToggle={toggleMulti}
          onClose={closeMulti}
          triggerContent={
            <TriggerContent
              title='Filter Assets'
              isOpen={openMulti}
            />
          }
        >
          <Each
            data={options}
            render={(asset, idx) => (
              <DropdownItem
                key={idx}
                asset={asset}
                isSelected={selectedMulti?.includes(asset) ?? false}
                onSelect={selectMulti}
              />
            )}
          />
        </Dropdown>
        <Text
          size='11'
          className='mt-2'
        >
          Selected: {selectedMulti?.join(', ') ?? '—'}
        </Text>
      </div>

      <div className='flex flex-col gap-[15px]'>
        <Text
          tag='h1'
          size='32'
          weight='500'
        >
          Treasury
        </Text>
        <Text
          size='15'
          className='text-primary-14'
        >
          Track Compound DAO&apos;s treasury portfolio including asset
          allocation, strategic holdings, and investment returns.
        </Text>
      </div>
      <div className='flex flex-col gap-5'>
        <div className='flex flex-row gap-5'>
          <Card className='flex-1'>
            <ValueMetricField
              value='$115.6M'
              label='Total Non-Comp Value'
              badge='+57M'
              badgeType='positive'
              icon={
                <FallbackImage
                  src='svg/wallet.svg'
                  width={32}
                  height={32}
                />
              }
            />
          </Card>
          <Card className='flex-1'>
            <ValueMetricField
              value='$115.6M'
              label='Total Non-Comp Value'
              badge='+57M'
              badgeType='positive'
              icon={
                <FallbackImage
                  src='not-found-icon.svg'
                  width={32}
                  height={32}
                />
              }
            />
          </Card>
          <Card className='flex-1'>
            <ValueMetricField
              value='$115.6M'
              label='Total Non-Comp Value'
              badge='+57M'
              badgeType='positive'
              icon={
                <FallbackImage
                  src='not-found-icon.svg'
                  width={32}
                  height={32}
                />
              }
            />
          </Card>
        </div>
        <div className='flex flex-row gap-5'>
          <Card className='flex-1'>
            <ValueMetricField
              className='gap-10'
              value='$115.6M'
              label='Total Non-Comp Value'
              badge='-57M'
              badgeType='negative'
              iconText='Total Value'
              icon={
                <FallbackImage
                  src='not-found-icon.svg'
                  width={32}
                  height={32}
                />
              }
            />
          </Card>
          <Card className='flex-1'>
            <ValueMetricField
              className='gap-10'
              value='$115.6M'
              label='Total Non-Comp Value'
              badge='-57M'
              badgeType='negative'
              iconText='Total Value'
              icon={
                <FallbackImage
                  src='not-found-icon.svg'
                  width={32}
                  height={32}
                />
              }
            />
          </Card>
        </div>
        <Card title='Treasury Composition'>
          <div className='flex flex-row items-center gap-3'>
            <Text
              size='11'
              className='text-primary-14'
            >
              Include COMP Holdings
            </Text>

            <Switch />
          </div>
          <TreasuryComposition />
        </Card>
        <Card title='Total Treasury Value'>
          <div className='flex flex-row items-center gap-3'>
            <Text
              size='11'
              weight='500'
              className='text-primary-14'
            >
              Include COMP Holdings
            </Text>

            <TabsGroup
              tabs={['7D', '30D', '90D', '1Y']}
              defaultTab='7D'
            />

            <TabsGroup
              tabs={['H', 'D', 'W']}
              defaultTab='D'
            />
          </div>
        </Card>
        <Card title='Treasury Balance by Network'>
          <TreasuryBalanceByNetwork />
        </Card>
        <Card title='Full Treasury Holdings'>
          <TreasuryHoldings />
        </Card>
      </div>
    </div>
  );
};

export default TreasuryPage;
