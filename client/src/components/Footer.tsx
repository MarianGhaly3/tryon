import { link, type PageName } from '../lib/router';
import Icon from './Icon';

const BOTTOM: [PageName, string, string][] = [
  ['home', 'home', 'Home'],
  ['shop', 'shop', 'Shop'],
  ['try-on', 'camera', 'Try On'],
  ['my-looks', 'looks', 'My Looks'],
  ['profile', 'user', 'Profile'],
];

export default function Footer({ page }: { page: PageName }) {
  return (
    <>
      <footer className="site-footer">
        <span>
          ÉCLAT <small>Find your look. Love your style.</small>
        </span>
        <p>© 2026 ÉCLAT · Virtual styling experience</p>
        <a href={link('upload')}>
          Upload your own product <Icon name="arrow" />
        </a>
      </footer>
      <nav className="bottom-nav" aria-label="Bottom navigation">
        {BOTTOM.map(([id, icon, label]) => (
          <a key={id} href={link(id)} className={`bottom-item ${page === id ? 'active' : ''} ${id === 'try-on' ? 'camera-nav' : ''}`.trim()} aria-current={page === id ? 'page' : undefined}>
            <Icon name={icon} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
