import SpendingsLedger from '@/entities/Spendings/SpendingsLedger';
import Text from '@/shared/ui/Text/Text';

const SpendingsPage = () => {
  return (
    <div className='flex flex-col gap-6 md:gap-[40px] lg:gap-[50px]'>
      <div className='mt-5 flex flex-col gap-[15px] px-3 md:mt-0 md:px-0'>
        <Text
          tag='h1'
          size='32'
          weight='500'
        >
          Spendings
        </Text>
        <Text
          tag='p'
          size='15'
          className='text-primary-14 leading-[140%] md:leading-[100%]'
        >
          Review annual vendor commitments, allocations, and renewal details.
        </Text>
      </div>
      <div className='flex flex-col gap-2.5 md:gap-2.5 lg:gap-5'>
        <SpendingsLedger />
      </div>
    </div>
  );
};

export default SpendingsPage;
