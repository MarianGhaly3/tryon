import Art from '../components/Art';
import Icon from '../components/Icon';
import { product } from '../data/products';
import { link } from '../lib/router';
import { useApp } from '../state/AppState';

const LINKS = [
  ['bag', 'My Bag', 'cart'],
  ['looks', 'My Looks', 'my-looks'],
  ['heart', 'Favorites', 'favorites'],
  ['upload', 'Upload Product (AI)', 'upload'],
  ['settings', 'Settings', 'settings'],
  ['help', 'Help & Support', 'help'],
] as const;

export default function Profile() {
  const { looks, favorites, cart, showInfo } = useApp();

  const action = (id: 'cart' | 'settings' | 'help') => {
    if (id === 'cart') {
      const items = cart.map((x) => product(x)).filter((p) => p !== undefined);
      showInfo(
        'My Bag',
        items.length ? (
          <>
            <div className="bag-items">
              {items.map((p) => (
                <div key={p.id}>
                  <Art name={p.art} label={p.name} />
                  <p>
                    {p.name}
                    <strong>${p.price}</strong>
                  </p>
                </div>
              ))}
            </div>
            <p className="bag-total">
              Total <strong>${items.reduce((sum, p) => sum + p.price, 0)}</strong>
            </p>
            <p>Checkout is not connected in this frontend preview.</p>
          </>
        ) : (
          <p>Your bag is waiting for something beautiful. Explore the collection to find your favorites.</p>
        ),
      );
    }
    if (id === 'settings') {
      showInfo('Your Preferences', <p>Your favorites and saved looks are kept in this browser. Sign-in and account synchronization are not connected in this preview.</p>);
    }
    if (id === 'help') {
      showInfo(
        'A Little Styling Help',
        <>
          <p>Browse the collection, tap a heart to save a favorite, or choose Try On to build a combination in the Styling Studio.</p>
          <p>Camera access works best on localhost or HTTPS. Enable it in the studio and the pieces follow your face.</p>
        </>,
      );
    }
  };

  return (
    <section className="profile-page">
      <div className="profile-heading">
        <h1>My Profile</h1>
        <button className="icon-button" aria-label="Profile settings" onClick={() => showInfo('ÉCLAT', <p>Preferences are stored on this device. Sign-in is a frontend preview.</p>)}>
          <Icon name="settings" />
        </button>
      </div>
      <div className="profile-card">
        <div className="profile-avatar">
          <Art name="avatar" label="avatar" />
          <a href={link('login')} aria-label="Edit profile">
            <Icon name="edit" />
          </a>
        </div>
        <h2>Freddy Hani</h2>
        <p>Your personal style, beautifully you.</p>
        <a className="text-button" href={link('login')}>
          Sign in to your account <Icon name="arrow" />
        </a>
      </div>
      <nav className="profile-links" aria-label="Your account">
        {LINKS.map(([icon, name, id]) =>
          id === 'cart' || id === 'settings' || id === 'help' ? (
            <button key={id} onClick={() => action(id)}>
              <Icon name={icon} />
              <span>{name}</span>
              <Icon name="back" className="chevron-right" />
            </button>
          ) : (
            <a key={id} href={link(id)}>
              <Icon name={icon} />
              <span>{name}</span>
              <Icon name="back" className="chevron-right" />
            </a>
          ),
        )}
      </nav>
      <div className="profile-stats">
        <div>
          <strong>{looks.length}</strong>
          <span>Saved Looks</span>
        </div>
        <div>
          <strong>{favorites.length}</strong>
          <span>Favorites</span>
        </div>
        <div>
          <strong>{cart.length}</strong>
          <span>In Your Bag</span>
        </div>
      </div>
    </section>
  );
}
