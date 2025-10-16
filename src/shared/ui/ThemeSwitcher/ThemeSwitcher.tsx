import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';
import { cn } from '@/shared/lib/classNames/classNames';
import Switch from '@/shared/ui/Switch/Switch';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const onToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Switch
      className={{
        block:
          'data-[state=checked]:bg-gray-10 data-[state=unchecked]:bg-white-11 w-[58px] p-0',
        thumb: cn(
          '!shadow-11 h-[30px] w-[30px] data-[state=unchecked]:translate-x-[-2px]',
          {
            '!bg-gray-13': Boolean(theme === 'dark')
          }
        )
      }}
      checked={Boolean(theme === 'dark')}
      onCheckedChange={onToggleTheme}
    />
  );
};

export default ThemeSwitcher;
