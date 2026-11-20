import type { Product } from '../types';
import { link, navigate } from '../lib/router';
import { useApp } from '../state/AppState';
import Art from './Art';
import Icon from './Icon';

export function FavoriteButton({ p }: { p: Product }) {
  const { favorites, toggleFavorite } = useApp();
  const on = favorites.includes(p.id);
  return (
    <button
      className={`favorite-button ${on ? 'active' : ''}`.trim()}
      aria-label={`${on ? 'Remove from' : 'Add to'} favorites: ${p.name}`}
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        toggleFavorite(p.id);
      }}
    >
      <Icon name="heart" />
    </button>
  );
}

/** Opens the Styling Studio with this product on and the camera starting. */
export function useTryOn() {
  const { selectProduct } = useApp();
  return (id: number) => {
    selectProduct(id);
    navigate('try-on', { item: String(id), camera: '1' });
  };
}

export default function ProductCard({ p, compact = false }: { p: Product; compact?: boolean }) {
  const tryOn = useTryOn();
  return (
    <article className={`product-card ${compact ? 'featured-card' : ''}`.trim()}>
      <div className="product-photo">
        <a href={link('product', { id: String(p.id) })} aria-label={`View ${p.name}`}>
          <Art name={p.art} label={p.name} />
        </a>
        <FavoriteButton p={p} />
      </div>
      <div className="product-info">
        <a className="product-name" href={link('product', { id: String(p.id) })}>
          {p.name}
        </a>
        <p className="product-rating">
          <span>★</span> {p.rating.toFixed(1)} <small>({p.reviews})</small>
        </p>
        <div className="product-bottom">
          <strong>${p.price}</strong>
          <button className="button primary small" onClick={() => tryOn(p.id)}>
            <Icon name="camera" />
            <span>{compact ? 'Try On' : 'Virtual Try-On'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ items, onReset }: { items: Product[]; onReset?: () => void }) {
  if (!items.length) {
    return (
      <div className="empty-state">
        <Icon name="search" />
        <h2>No pieces found</h2>
        <p>Try a different search or clear your filters.</p>
        {onReset && (
          <button className="button secondary" onClick={onReset}>
            Clear filters
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="product-grid">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
