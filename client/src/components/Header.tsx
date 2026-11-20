import { useEffect, useState, type FormEvent } from 'react';
import { link, navigate, type PageName } from '../lib/router';
import Art from './Art';
import Icon from './Icon';
import Logo from './Logo';

const NAVS: [PageName, string, string][] = [
  ['home', 'home', 'Home'],
  ['shop', 'shop', 'Shop'],
  ['try-on', 'camera', 'Try On'],
  ['my-looks', 'looks', 'My Looks'],
  ['favorites', 'heart', 'Favorites'],
];

export default function Header({ page }: { page: PageName }) {
  const [menu, setMenu] = useState(false);
  const [bell, setBell] = useState(false);

  useEffect(() => {
    setMenu(false);
    setBell(false);
  }, [page]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false);
        setBell(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const search = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get('search') ?? '').trim();
    navigate('shop', { search: q || undefined });
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="icon-button mobile-menu-button" id="menuToggle" aria-label="Open navigation" aria-expanded={menu} aria-controls="mobileMenu" onClick={() => setMenu(!menu)}>
          <Icon name="menu" />
        </button>
        <Logo />
        <nav className="desktop-nav" aria-label="Main navigation">
          {NAVS.map(([id, icon, label]) => (
            <a key={id} href={link(id)} className={`nav-link ${page === id ? 'active' : ''}`.trim()} aria-current={page === id ? 'page' : undefined}>
              <Icon name={icon} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <form className="header-search" role="search" onSubmit={search}>
            <input name="search" placeholder="Search products..." aria-label="Search products" />
            <button className="icon-button" aria-label="Search">
              <Icon name="search" />
            </button>
          </form>
          <a className="icon-button mobile-search" href={link('shop')} aria-label="Search products">
            <Icon name="search" />
          </a>
          <button id="notifications" className="icon-button notification-button" aria-label="Notifications" aria-expanded={bell} onClick={() => setBell(!bell)}>
            <Icon name="bell" />
            <span className="notification-dot" />
          </button>
          <a className="avatar" href={link('profile')} aria-label="My profile">
            <Art name="avatar" />
          </a>
        </div>
      </div>
      <nav id="mobileMenu" className="mobile-menu" aria-label="Mobile navigation" hidden={!menu}>
        {[...NAVS, ['upload', 'upload', 'Upload Product'], ['profile', 'user', 'My Profile']].map(([id, icon, label]) => (
          <a key={id} href={link(id as PageName)} className={`nav-link ${page === id ? 'active' : ''}`.trim()}>
            <Icon name={icon} />
            {label}
          </a>
        ))}
      </nav>
      <div id="notificationPanel" className="notification-panel" hidden={!bell}>
        <strong>
          You're all caught up <Icon name="check" />
        </strong>
        <p>Your next favorite look is waiting in the collection.</p>
        <a href={link('shop')}>
          Explore the collection <Icon name="arrow" />
        </a>
      </div>
    </header>
  );
}
