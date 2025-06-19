import { useTheme } from '@/app/providers/ThemeProvider';
import Switch from '@/shared/ui/Switch/Switch';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const onToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Switch
      className='data-[state=checked]:bg-gray-10 data-[state=unchecked]:bg-white-11 w-[58px] p-0'
      thumbClassName='w-[30px] h-[30px] bg-primary-15 !shadow-11 data-[state=unchecked]:translate-x-[-2px]'
      checked={Boolean(theme === 'dark')}
      onCheckedChange={onToggleTheme}
    />
  );
};

export default ThemeSwitcher;
