import { PageWrapper } from '@/shared/ui/atoms';
import { Footer } from '@/widget/Footer';
import { Header } from '@/widget/Header';
import { AppRouter, withTheme } from '@/app/providers';

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
