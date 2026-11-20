import { useEffect, type ReactNode } from 'react';
import { InfoDialog, Toast } from './components/Dialogs';
import Footer from './components/Footer';
import Header from './components/Header';
import { pageOf, useRoute, type PageName } from './lib/router';
import Auth from './pages/Auth';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import MyLooks from './pages/MyLooks';
import Product from './pages/Product';
import Profile from './pages/Profile';
import Shop from './pages/Shop';
import TryOn from './pages/TryOn';
import Upload from './pages/Upload';

const TITLES: Record<PageName, string> = {
  home: 'Home',
  shop: 'Shop',
  'try-on': 'Try On',
  product: 'Product',
  'my-looks': 'My Looks',
  favorites: 'Favorites',
  upload: 'Upload',
  profile: 'Profile',
  login: 'Login',
  signup: 'Signup',
};

const VIEWS: Record<PageName, () => ReactNode> = {
  home: () => <Home />,
  shop: () => <Shop />,
  'try-on': () => <TryOn />,
  product: () => <Product />,
  'my-looks': () => <MyLooks />,
  favorites: () => <Favorites />,
  upload: () => <Upload />,
  profile: () => <Profile />,
  login: () => <Auth mode="login" />,
  signup: () => <Auth mode="signup" />,
};

export default function App() {
  const route = useRoute();
  const page = pageOf(route);
  // The product page changes with its ?id=, the others only with the page
  const key = page === 'product' ? `product-${route.query.id ?? ''}` : page;

  useEffect(() => {
    document.body.dataset.page = page;
    document.title = `${TITLES[page]} | ÉCLAT Virtual Try-On`;
    window.scrollTo(0, 0);
  }, [page, route.query.id]);

  return (
    <>
      <a
        className="skip-link"
        href="#mainContent"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('mainContent')?.focus();
        }}
      >
        Skip to content
      </a>
      <div id="app">
        <Header page={page} />
        <main className={`page page-${page}`} id="mainContent" tabIndex={-1} key={key}>
          {VIEWS[page]()}
        </main>
        <Footer page={page} />
        <InfoDialog />
        <Toast />
      </div>
    </>
  );
}
