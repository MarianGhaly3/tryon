import { product } from '../data/products';
import { link } from '../lib/router';
import Art, { asset } from '../components/Art';
import { CategoryCards, SectionHeading, Sparkle } from '../components/Common';
import Icon from '../components/Icon';
import ProductCard from '../components/ProductCard';

const RAIL: [string, string, number][] = [
  ['rose', 'glasses', 1],
  ['hoops', 'earrings', 3],
  ['necklace', 'necklaces', 4],
  ['lips', 'makeup', 5],
];

const FEATURES: [string, string[]][] = [
  ['lightning', ['Real-Time', 'Try-On']],
  ['chip', ['AI-Powered', 'Fit']],
  ['layers', ['Mix & Match', 'Looks']],
  ['shield', ['Secure &', 'Private']],
];

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <h1>
            <span className="desktop-title">
              Try Before You Buy
              <br />
              with Virtual Try-On
            </span>
            <span className="mobile-title">
              Try It Before
              <br />
              You Buy <b>✦</b>
            </span>
          </h1>
          <p>
            See how glasses, earrings, necklaces and
            <br className="desktop-only" /> makeup look on you in real time with AI.
          </p>
          <div className="hero-buttons">
            <a className="button primary" href={link('try-on', { camera: '1' })}>
              <Icon name="camera" /> Try It On Now <Icon name="arrow" />
            </a>
            <a className="button secondary" href={link('shop')}>
              Shop Collection
            </a>
          </div>
          <div className="hero-benefits">
            <span>
              <Icon name="lightning" />
              Real-Time Try-On
            </span>
            <span>
              <Icon name="sparkles" />
              AI Face Tracking
            </span>
            <span>
              <Icon name="shield" />
              Realistic &amp; Accurate
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-ellipse" />
          <img className="hero-model" src={asset('hero-cutout.webp')} alt="Woman wearing rose sunglasses, gold hoops and a daisy necklace" />
          <div className="face-corners">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="hero-look-items">
            {RAIL.map(([art, name, id]) => (
              <a key={art} href={link('try-on', { item: String(id), camera: '1' })} aria-label={`Try ${name}`}>
                <Art name={art} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mobile-benefits" aria-label="Styling features">
        {FEATURES.map(([icon, [a, b]]) => (
          <div key={icon}>
            <span>
              <Icon name={icon} />
            </span>
            <p>
              {a}
              <br />
              {b}
            </p>
          </div>
        ))}
      </section>

      <div className="home-content">
        <section className="home-categories">
          <SectionHeading
            title={
              <>
                Trending Categories <Sparkle />
              </>
            }
          />
          <div className="categories-row">
            <CategoryCards />
            <a className="category-card mix-card" href={link('try-on')}>
              <Icon name="layers" />
              <strong>Mix &amp; Match</strong>
            </a>
            <a className="signature-card" href={link('try-on')}>
              <div>
                <h3>
                  Create Your
                  <br />
                  Signature Look
                </h3>
                <p>
                  Mix accessories and makeup
                  <br />
                  together in real time.
                </p>
              </div>
              <img src={asset('hero-cutout.webp')} alt="" />
              <span>
                <Icon name="arrow" />
              </span>
            </a>
          </div>
        </section>

        <section className="home-featured">
          <SectionHeading
            title={
              <>
                Featured Products <Sparkle />
              </>
            }
          />
          <div className="featured-grid">
            {[1, 3, 4, 5].map((id) => (
              <ProductCard key={id} p={product(id)!} compact />
            ))}
          </div>
        </section>

        <section className="eyewear-banner">
          <div>
            <span className="collection-tag">New Collection</span>
            <h2>
              Luxury
              <br />
              Eyewear
            </h2>
            <p>
              Modern styles for
              <br />
              every look
            </p>
            <a className="button primary" href={link('shop', { category: 'Glasses' })}>
              Explore Now <Icon name="arrow" />
            </a>
          </div>
          <Art name="eyewear" cls="banner-art" label="Luxury rose cat-eye sunglasses" />
        </section>
        <div className="banner-dots" aria-hidden="true">
          <i className="active" />
          <i />
          <i />
        </div>
      </div>
    </>
  );
}
