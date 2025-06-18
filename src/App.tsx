import { AppRouter } from './app/providers/router/AppRouter';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import PageWrapper from './shared/ui/PageWrapper/PageWrapper';

function App() {
  return (
    <PageWrapper className='gap-[60px]'>
      <Header />
      <main className='mx-auto flex w-full max-w-[1084px] flex-grow flex-col'>
        <AppRouter />
      </main>
      <Footer />
    </PageWrapper>
  );
}

export default App;
