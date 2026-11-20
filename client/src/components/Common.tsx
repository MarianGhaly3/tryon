import type { ReactNode } from 'react';
import { CATEGORIES } from '../data/products';
import { link } from '../lib/router';
import Art from './Art';
import Icon, { categoryIcon } from './Icon';

export const Sparkle = () => <span className="sparkle">✦</span>;

export function SectionHeading({ title, href = link('shop'), label = 'View All' }: { title: ReactNode; href?: string; label?: string }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      <a href={href}>
        {label} <Icon name="arrow" />
      </a>
    </div>
  );
}

export function CategoryTabs({ active, onPick }: { active: string; onPick: (c: string) => void }) {
  return (
    <div className="category-tabs" role="group" aria-label="Product categories">
      {CATEGORIES.map((c) => (
        <button key={c} className={`pill ${c === active ? 'active' : ''}`.trim()} aria-pressed={c === active} onClick={() => onPick(c)}>
          {c === 'All' ? null : <Icon name={categoryIcon(c)} />}
          {c}
        </button>
      ))}
    </div>
  );
}

export function CategoryCards() {
  return (
    <>
      {CATEGORIES.slice(1).map((c, i) => (
        <a key={c} className="category-card" href={link('shop', { category: c })}>
          <Art name={['rose', 'hoops', 'necklace', 'lipstick'][i]} label={c} />
          <strong>{c}</strong>
        </a>
      ))}
    </>
  );
}
