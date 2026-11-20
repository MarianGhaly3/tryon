import { useEffect, useState, type CSSProperties } from 'react';
import Art from '../components/Art';
import { SectionHeading, Sparkle } from '../components/Common';
import Icon from '../components/Icon';
import ProductCard, { FavoriteButton, useTryOn } from '../components/ProductCard';
import { PRODUCTS, product } from '../data/products';
import { link, useRoute } from '../lib/router';
import { useApp } from '../state/AppState';

export default function Product() {
  const { query } = useRoute();
  const p = product(query.id) ?? PRODUCTS[0];
  const { addToCart } = useApp();
  const tryOn = useTryOn();
  const swatches: [string, string][] = [
    [p.color, p.color === 'Gold' ? '#e4b26d' : '#bb7c89'],
    ['Brown', '#754434'],
    ['Black', '#292929'],
    ['Silver', '#aaa4a5'],
  ];
  const [color, setColor] = useState(p.color);
  useEffect(() => setColor(p.color), [p.id, p.color]);

  return (
    <>
      <section className="product-detail">
        <div className="product-detail-image">
          <a className="detail-back icon-button" href={link('shop')} aria-label="Back to shop">
            <Icon name="back" />
          </a>
          <Art name={p.art} label={p.name} />
          <FavoriteButton p={p} />
        </div>
        <div className="product-detail-info">
          <a className="breadcrumb" href={link('shop', { category: p.category })}>
            Collection / {p.category}
          </a>
          <span className="eyebrow">THE ÉCLAT COLLECTION</span>
          <h1>{p.name}</h1>
          <p className="detail-rating">
            <span className="stars">★★★★★</span> {p.rating} <span>({p.reviews} reviews)</span>
          </p>
          <strong className="detail-price">${p.price}</strong>
          <p className="detail-description">
            A little detail. A whole new look. Discover your perfect finishing touch with {p.name.toLowerCase()}, thoughtfully selected for effortless, everyday elegance.
          </p>
          <p className="color-label">
            Color: <strong id="selectedColor">{color}</strong>
          </p>
          <div className="color-options">
            {swatches.map(([c, swatch]) => (
              <button
                key={c}
                className={`color-dot ${c === color ? 'active' : ''}`.trim()}
                style={{ '--swatch': swatch } as CSSProperties}
                aria-label={c}
                aria-pressed={c === color}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <div className="detail-buttons">
            <button className="button secondary" onClick={() => tryOn(p.id)}>
              <Icon name="camera" /> Try It On
            </button>
            <button className="button primary" onClick={() => addToCart(p.id)}>
              <Icon name="shop" /> Add to Bag
            </button>
          </div>
          <div className="detail-perks">
            <span>
              <Icon name="shield" /> Secure &amp; private
            </span>
            <span>
              <Icon name="sparkles" /> Find your perfect fit
            </span>
          </div>
          <details className="product-description" open>
            <summary>Details &amp; styling</summary>
            <p>
              {p.color} finish · {p.style} style. Pair with your favorite pieces in the Styling Studio to create a look that feels like you.
            </p>
          </details>
        </div>
      </section>
      <section className="related-products">
        <SectionHeading
          title={
            <>
              Complete Your Look <Sparkle />
            </>
          }
        />
        <div className="featured-grid">
          {PRODUCTS.filter((x) => x.category !== p.category)
            .slice(0, 4)
            .map((x) => (
              <ProductCard key={x.id} p={x} compact />
            ))}
        </div>
      </section>
    </>
  );
}
