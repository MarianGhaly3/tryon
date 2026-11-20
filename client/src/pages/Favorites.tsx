import { PRODUCTS } from '../data/products';
import { link } from '../lib/router';
import Icon from '../components/Icon';
import { ProductGrid } from '../components/ProductCard';
import { useApp } from '../state/AppState';

export default function Favorites() {
  const { favorites } = useApp();
  const items = PRODUCTS.filter((p) => favorites.includes(p.id));
  return (
    <section className="standard-page">
      <div className="page-heading">
        <div>
          <h1>
            My Favorites <Icon name="heart" />
          </h1>
          <p>A little collection of everything you love.</p>
        </div>
        <a className="button secondary" href={link('shop')}>
          Explore Collection <Icon name="arrow" />
        </a>
      </div>
      <div id="favoritesGrid">
        {items.length ? (
          <ProductGrid items={items} />
        ) : (
          <div className="empty-state">
            <Icon name="heart" />
            <h2>A space for your favorites</h2>
            <p>Tap the heart on a piece you love. You'll find it right here.</p>
            <a className="button primary" href={link('shop')}>
              Discover the Collection <Icon name="arrow" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
