import { AppRouter } from '@/app/providers/router/AppRouter';
import PageWrapper from '@/shared/ui/PageWrapper/PageWrapper';
import Footer from '@/widget/Footer/Footer';
import Header from '@/widget/Header/Header';

import { withTheme } from './app/providers/ThemeProvider/theme-provider';

function App() {
  return (
    <PageWrapper className='gap-0 md:gap-[60px]'>
      <Header />
      <main className='mx-auto flex w-full max-w-[1084px] flex-grow flex-col'>
        <AppRouter />
      </main>
      <Footer />
    </PageWrapper>
  );
}

export default withTheme(App);
