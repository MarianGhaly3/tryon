import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DEMO_LOOKS, product } from '../data/products';
import type { Adjust, Look } from '../types';

/** Same keys as the ÉCLAT design, so saved data of the design keeps working. */
const read = <T,>(key: string, fallback: T): T => {
  try {
    return (JSON.parse(localStorage.getItem(`eclat_${key}`) ?? 'null') as T) ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown): boolean => {
  try {
    localStorage.setItem(`eclat_${key}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const validIds = (value: unknown): number[] =>
  Array.isArray(value) ? [...new Set(value.filter((id) => product(id)).map(Number))] : [];

function readLooks(): Look[] {
  const saved = read<unknown>('looks_v2', DEMO_LOOKS);
  const list = Array.isArray(saved) ? (saved as Look[]) : DEMO_LOOKS;
  return list
    .filter((l) => l && typeof l.name === 'string' && Array.isArray(l.ids))
    .map((l) => ({ ...l, ids: validIds(l.ids) }));
}

export type InfoContent = { title: string; body: ReactNode };

type AppState = {
  favorites: number[];
  toggleFavorite: (id: number) => void;
  addFavorites: (ids: number[]) => void;
  selected: number[];
  setSelected: (ids: number[]) => void;
  /** Puts a product on, replacing the product of the same category. */
  selectProduct: (id: number) => void;
  removeSelected: (id: number) => void;
  looks: Look[];
  saveLook: (look: Omit<Look, 'id' | 'date'>) => boolean;
  updateLooks: (next: Look[]) => void;
  cart: number[];
  addToCart: (id: number) => void;
  message: string;
  toast: (text: string) => void;
  info: InfoContent | null;
  showInfo: (title: string, body: ReactNode) => void;
  closeInfo: () => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>(() => validIds(read('favorites', [])));
  const [selected, setSelectedState] = useState<number[]>(() => validIds(read('selected', [1, 3, 4, 5])));
  const [looks, setLooks] = useState<Look[]>(readLooks);
  const [cart, setCart] = useState<number[]>(() => validIds(read('cart', [])));
  const [message, setMessage] = useState('');
  const [info, setInfo] = useState<InfoContent | null>(null);
  const timer = useRef<number>(0);

  const toast = useCallback((text: string) => {
    window.clearTimeout(timer.current);
    setMessage(text);
    timer.current = window.setTimeout(() => setMessage(''), 3500);
  }, []);

  const toggleFavorite = useCallback(
    (id: number) => {
      const has = favorites.includes(id);
      const next = has ? favorites.filter((x) => x !== id) : [...favorites, id];
      setFavorites(next);
      write('favorites', next);
      toast(has ? 'Removed from favorites' : 'Added to your favorites');
    },
    [favorites, toast],
  );

  const addFavorites = useCallback(
    (ids: number[]) => {
      const next = [...new Set([...favorites, ...ids])];
      setFavorites(next);
      write('favorites', next);
    },
    [favorites],
  );

  const setSelected = useCallback((ids: number[]) => {
    setSelectedState(ids);
    write('selected', ids);
  }, []);

  const selectProduct = useCallback(
    (id: number) => {
      const p = product(id);
      if (!p) return;
      setSelected([...selected.filter((x) => product(x)?.category !== p.category), id]);
    },
    [selected, setSelected],
  );

  const removeSelected = useCallback((id: number) => setSelected(selected.filter((x) => x !== id)), [selected, setSelected]);

  const updateLooks = useCallback((next: Look[]) => {
    setLooks(next);
    write('looks_v2', next);
  }, []);

  const saveLook = useCallback(
    (look: Omit<Look, 'id' | 'date'>) => {
      const next = [{ ...look, id: `look-${Date.now()}`, date: new Date().toISOString() }, ...looks];
      setLooks(next);
      return write('looks_v2', next);
    },
    [looks],
  );

  const addToCart = useCallback(
    (id: number) => {
      const next = cart.includes(id) ? cart : [...cart, id];
      setCart(next);
      write('cart', next);
      toast(`Added to your bag · ${next.length} ${next.length === 1 ? 'piece' : 'pieces'}`);
    },
    [cart, toast],
  );

  const showInfo = useCallback((title: string, body: ReactNode) => setInfo({ title, body }), []);
  const closeInfo = useCallback(() => setInfo(null), []);

  // Several tabs: keep favorites and looks in step with the other tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'eclat_favorites') setFavorites(validIds(read('favorites', [])));
      if (e.key === 'eclat_looks_v2') setLooks(readLooks());
      if (e.key === 'eclat_cart') setCart(validIds(read('cart', [])));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      favorites,
      toggleFavorite,
      addFavorites,
      selected,
      setSelected,
      selectProduct,
      removeSelected,
      looks,
      saveLook,
      updateLooks,
      cart,
      addToCart,
      message,
      toast,
      info,
      showInfo,
      closeInfo,
    }),
    [favorites, toggleFavorite, addFavorites, selected, setSelected, selectProduct, removeSelected, looks, saveLook, updateLooks, cart, addToCart, message, toast, info, showInfo, closeInfo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}

export type { Adjust };
