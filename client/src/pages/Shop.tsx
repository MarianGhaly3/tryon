import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { CATEGORIES, PRODUCTS } from '../data/products';
import { link, useRoute } from '../lib/router';
import { CategoryTabs } from '../components/Common';
import Icon, { categoryIcon } from '../components/Icon';
import { ProductGrid } from '../components/ProductCard';

const COLORS: [string, string][] = [
  ['Rose', '#a75b71'],
  ['Black', '#292929'],
  ['Brown', '#83502f'],
  ['Gold', '#e4b26d'],
  ['Green', '#4f645a'],
];
const BRANDS = ['ÉCLAT', 'RayVision', 'LuxeEye', 'GlowBeauty'];

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function Shop() {
  const { query } = useRoute();
  const fromUrl = (CATEGORIES as readonly string[]).includes(query.category) ? query.category : 'All';
  const [category, setCategory] = useState<string>(fromUrl);
  const [search, setSearch] = useState(query.search ?? '');
  const [color, setColor] = useState('');
  const [sort, setSort] = useState('popular');
  const [chosen, setChosen] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200);
  const [open, setOpen] = useState(false);

  // A new link (header search, category card) changes what is shown
  useEffect(() => {
    setCategory(fromUrl);
    setSearch(query.search ?? '');
  }, [fromUrl, query.search]);

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = PRODUCTS.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        (!chosen.length || chosen.includes(p.category)) &&
        (!brands.length || brands.includes(p.brand)) &&
        (!color || p.color === color) &&
        p.price <= maxPrice &&
        p.rating >= minRating &&
        `${p.name} ${p.category} ${p.color}`.toLowerCase().includes(q),
    );
    if (sort === 'low') list.sort((a, b) => a.price - b.price);
    if (sort === 'high') list.sort((a, b) => b.price - a.price);
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    // The default order is the curated collection shown in the reference.
    if (sort === 'new') list.sort((a, b) => b.id - a.id);
    return list;
  }, [category, chosen, brands, color, maxPrice, minRating, search, sort]);

  const reset = () => {
    setCategory('All');
    setColor('');
    setSearch('');
    setMaxPrice(200);
    setSort('popular');
    setChosen([]);
    setBrands([]);
    setMinRating(0);
  };

  return (
    <div className="shop-layout">
      <aside className={`filters-panel ${open ? 'open' : ''}`.trim()} id="shopFilters">
        <div className="filters-title">
          <h2>Filters</h2>
          <button className="text-button" onClick={reset}>
            Clear All
          </button>
        </div>
        <fieldset>
          <legend>
            Category <Icon name="down" />
          </legend>
          {CATEGORIES.slice(1).map((c) => (
            <label key={c} className="check-label">
              <input type="checkbox" name="filter-category" value={c} checked={chosen.includes(c)} onChange={() => { setChosen(toggle(chosen, c)); setCategory('All'); }} />
              <Icon name={categoryIcon(c)} />
              <span>
                {c} <small>({PRODUCTS.filter((p) => p.category === c).length})</small>
              </span>
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>
            Price Range <Icon name="down" />
          </legend>
          <input id="priceRange" type="range" min="0" max="200" step="5" value={maxPrice} aria-label="Maximum price" onChange={(e) => setMaxPrice(Number(e.target.value))} />
          <div className="range-endpoints">
            <span>$0</span>
            <span id="priceLabel">${maxPrice}</span>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            Brand <Icon name="down" />
          </legend>
          {BRANDS.map((b) => (
            <label key={b} className="check-label">
              <input type="checkbox" name="filter-brand" value={b} checked={brands.includes(b)} onChange={() => setBrands(toggle(brands, b))} />
              <span>
                {b} <small>({PRODUCTS.filter((p) => p.brand === b).length})</small>
              </span>
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>
            Color <Icon name="down" />
          </legend>
          <div className="color-options">
            {COLORS.map(([c, hex]) => (
              <button
                key={c}
                className={`color-dot ${color === c ? 'active' : ''}`.trim()}
                style={{ '--swatch': hex } as CSSProperties}
                aria-label={c}
                aria-pressed={color === c}
                onClick={() => setColor(color === c ? '' : c)}
              />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>
            Rating <Icon name="down" />
          </legend>
          {[4.9, 4.8, 4.7].map((r) => (
            <label key={r} className="check-label">
              <input type="radio" name="filter-rating" value={r} checked={minRating === r} onChange={() => setMinRating(r)} />
              <span>
                <b className="stars">★★★★★</b> {r} &amp; Up
              </span>
            </label>
          ))}
        </fieldset>
        <a className="filter-promo" href={link('try-on')}>
          <Icon name="sparkles" />
          <strong>
            Your perfect fit,
            <br />
            one try-on away.
          </strong>
          <span>
            Visit the Styling Studio <Icon name="arrow" />
          </span>
        </a>
      </aside>

      <section className="shop-main">
        <div className="page-heading">
          <div>
            <h1>Shop Collection</h1>
            <p>Discover stylish accessories and makeup, and try them on virtually.</p>
          </div>
          <label className="sort-control">
            Sort by:{' '}
            <select id="sortBy" aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="popular">Most Popular</option>
              <option value="new">Newest</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </label>
        </div>
        <CategoryTabs
          active={category}
          onPick={(c) => {
            setCategory(c);
            setChosen([]);
          }}
        />
        <div className="shop-toolbar">
          <label className="collection-search">
            <Icon name="search" />
            <input id="shopSearch" placeholder="Search this collection" aria-label="Search this collection" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <span id="resultCount" role="status">
            {items.length} {items.length === 1 ? 'piece' : 'pieces'}
          </span>
          <button className="button secondary filter-toggle" id="filterToggle" aria-controls="shopFilters" aria-expanded={open} onClick={() => setOpen(!open)}>
            <Icon name="filter" /> Filters
          </button>
        </div>
        <div id="shopResults">
          <ProductGrid items={items} onReset={reset} />
        </div>
      </section>
    </div>
  );
}
