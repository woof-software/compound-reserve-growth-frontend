import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';
import Card from '@/shared/ui/Card/Card';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

import BreakPointDark from '@/shared/assets/svg/break-point-dark.svg';
import BreakPointLight from '@/shared/assets/svg/break-point-light.svg';

const BreakPointBlock = () => {
  const { theme } = useTheme();

  return (
    <div className='flex h-dvh items-center justify-center px-4'>
      <Card
        className={{
          container: 'shadow-none',
          content: 'flex min-h-[250px] flex-col items-center justify-center'
        }}
      >
        <View.Condition if={theme === 'dark'}>
          <BreakPointDark
            width='100%'
            height='72px'
          />
        </View.Condition>
        <View.Condition if={theme === 'light'}>
          <BreakPointLight
            width='100%'
            height='72px'
          />
        </View.Condition>
        <Text
          size='13'
          weight='400'
          lineHeight='160'
          align='center'
          className='text-primary-14 mt-3'
        >
          This website is currently optimized for desktop devices only. Please
          access it from a desktop or a larger screen for the best experience.
        </Text>
      </Card>
    </div>
  );
};

export default BreakPointBlock;
