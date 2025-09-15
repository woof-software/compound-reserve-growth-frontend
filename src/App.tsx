import { AppRouter } from '@/app/providers/router/AppRouter';
import { withTheme } from '@/app/providers/ThemeProvider/theme-provider';
import PageWrapper from '@/shared/ui/atoms/PageWrapper/PageWrapper';
import { Footer } from '@/widget/Footer';
import { Header } from '@/widget/Header';

function App() {
  return (
    <PageWrapper className='gap-0 md:gap-[60px]'>
      <Header />
      <AppRouter />
      <Footer />
    </PageWrapper>
  );
}

export default withTheme(App);
