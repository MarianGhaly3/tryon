import { useEffect, useState } from 'react';

export type Query = Record<string, string>;
export type Route = { path: string[]; query: Query };

/** Tiny hash router: #/shop?c=glasses, #/product/aurora-gold. Needs no server rewrites. */
function parse(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [p, qs = ''] = raw.split('?');
  const query: Query = {};
  new URLSearchParams(qs).forEach((v, k) => {
    query[k] = v;
  });
  return { path: p.split('/').filter(Boolean), query };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parse);
  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function href(path: string, query?: Record<string, string | undefined>): string {
  const qs = new URLSearchParams(
    Object.entries(query ?? {}).filter((e): e is [string, string] => Boolean(e[1])),
  ).toString();
  return `#${path}${qs ? `?${qs}` : ''}`;
}

export function go(path: string, query?: Record<string, string | undefined>) {
  window.location.hash = href(path, query).slice(1);
}

/** The pages of the ÉCLAT design. */
export const PAGES = ['home', 'shop', 'try-on', 'product', 'my-looks', 'favorites', 'upload', 'profile', 'login', 'signup'] as const;
export type PageName = (typeof PAGES)[number];

export const pageOf = (route: Route): PageName => {
  const first = route.path[0] ?? 'home';
  return (PAGES as readonly string[]).includes(first) ? (first as PageName) : 'home';
};

/** Link to a page of the design, for example link('shop', { category: 'Glasses' }). */
export const link = (page: PageName, query?: Record<string, string | undefined>) =>
  href(page === 'home' ? '/' : `/${page}`, query);

export const navigate = (page: PageName, query?: Record<string, string | undefined>) =>
  go(page === 'home' ? '/' : `/${page}`, query);
