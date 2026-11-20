import { useState, type CSSProperties } from 'react';
import Art from '../components/Art';
import { Sparkle } from '../components/Common';
import Icon from '../components/Icon';
import { product } from '../data/products';
import { link, navigate } from '../lib/router';
import { useApp } from '../state/AppState';
import type { Look } from '../types';

type Filter = 'all' | 'collections' | 'recent' | 'favorites';

const day = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** A saved look shows the photo taken in the studio, or the design's sample photo. */
function LookPicture({ look }: { look: Look }) {
  return look.photo ? <img className="look-capture" src={look.photo} alt={look.name} /> : <Art name={look.art || 'look1'} label={look.name} />;
}

export default function MyLooks() {
  const { looks, updateLooks, setSelected, toast, showInfo, closeInfo } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [edit, setEdit] = useState(0);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  let visible = looks.map((l, index) => ({ l, index }));
  if (filter === 'favorites') visible = visible.filter(({ l }) => l.favorite);
  if (filter === 'recent') visible.reverse();

  const current = looks[edit];
  const editing = current && (name ?? current.name);
  const choose = (index: number) => {
    setEdit(index);
    setName(null);
    setZoom(100);
    setOpen(true);
  };

  const patch = (index: number, change: Partial<Look>) => updateLooks(looks.map((l, i) => (i === index ? { ...l, ...change } : l)));

  const share = (l: Look) => {
    const text = `My ÉCLAT look: ${l.ids.map((id) => product(id)?.name).join(', ')}`;
    if (navigator.share) navigator.share({ title: 'My ÉCLAT Look', text }).catch(() => undefined);
    else if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => toast('Look details copied to clipboard'));
    else showInfo('Share Your Look', <p>{text}</p>);
  };

  const menu = (index: number) => {
    const look = looks[index];
    showInfo(
      look.name,
      <div className="look-menu-actions">
        <button
          className="button secondary"
          onClick={() => {
            updateLooks([...looks, { ...look, id: `look-${Date.now()}`, name: `${look.name} (copy)`, ids: [...look.ids] }]);
            closeInfo();
            toast('Look duplicated');
          }}
        >
          <Icon name="layers" /> Duplicate Look
        </button>
        <button
          className="button secondary"
          onClick={() => {
            const next = looks.filter((_, i) => i !== index);
            updateLooks(next);
            setEdit(Math.max(0, Math.min(edit, next.length - 1)));
            closeInfo();
            toast('Look removed');
          }}
        >
          <Icon name="trash" /> Delete Look
        </button>
      </div>,
    );
  };

  const FILTERS: [Filter, string, string][] = [
    ['collections', 'layers', 'Look Collections'],
    ['recent', 'clock', 'Recently Viewed'],
    ['favorites', 'heart', 'Favorites'],
  ];

  return (
    <div className="looks-layout">
      <aside className="looks-sidebar">
        <h1>
          My Looks <Sparkle />
        </h1>
        <p>Your saved styles and outfits</p>
        <div className="looks-nav">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            <Icon name="looks" /> Saved Looks <span id="lookCount">({looks.length})</span>
          </button>
          <a href={link('try-on')}>
            <Icon name="plus" /> Create New Look
          </a>
          <button className={filter === 'collections' ? 'active' : ''} onClick={() => setFilter('collections')}>
            <Icon name="layers" /> Look Collections
          </button>
          <hr />
          {FILTERS.slice(1).map(([f, icon, label]) => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              <Icon name={icon} /> {label}
            </button>
          ))}
        </div>
        <div className="storage-card">
          <Icon name="upload" />
          <div>
            <strong>Look Library</strong>
            <p id="storageCaption">
              {looks.length} beautiful {looks.length === 1 ? 'look' : 'looks'} saved
            </p>
          </div>
          <progress id="storageProgress" max={20} value={Math.min(looks.length, 20)} aria-label="Saved looks" />
        </div>
      </aside>

      <section className="looks-content">
        <div className="mobile-page-heading">
          <h1>
            My Looks <Sparkle />
          </h1>
          <a className="button primary small" href={link('try-on')}>
            <Icon name="plus" /> New Look
          </a>
        </div>
        <div id="looksGrid" className="looks-grid">
          {filter === 'collections' && (
            <div className="collection-intro">
              <h2>Your Look Collection</h2>
              <p>All your personal combinations, together in one place.</p>
            </div>
          )}
          {visible.length ? (
            visible.map(({ l, index }) => (
              <article key={l.id} className={`look-card ${index === edit ? 'selected' : ''}`.trim()}>
                <button className="look-photo" aria-label={`Edit ${l.name}`} onClick={() => choose(index)}>
                  <LookPicture look={l} />
                </button>
                <button
                  className={`look-favorite ${l.favorite ? 'active' : ''}`.trim()}
                  aria-label={`Favorite ${l.name}`}
                  aria-pressed={Boolean(l.favorite)}
                  onClick={() => patch(index, { favorite: !l.favorite })}
                >
                  <Icon name="heart" />
                </button>
                <div className="look-card-info">
                  <div>
                    <button className="text-button" onClick={() => choose(index)}>
                      {l.name}
                    </button>
                    <small>{day(l.date)}</small>
                  </div>
                  <button className="icon-button" aria-label={`Options for ${l.name}`} onClick={() => menu(index)}>
                    <Icon name="more" />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <Icon name="looks" />
              <h2>{filter === 'favorites' ? 'Your favorite looks go here' : 'Your next look starts here'}</h2>
              <p>{filter === 'favorites' ? 'Tap the heart on a saved look to add it.' : 'Mix your favorite pieces in the Styling Studio.'}</p>
              <a className="button primary" href={link('try-on')}>
                Create a Look <Icon name="arrow" />
              </a>
            </div>
          )}
        </div>
      </section>

      <aside className={`look-editor ${open ? 'mobile-open' : ''}`.trim()} id="lookEditor">
        {current ? (
          <>
            <div className="editor-heading">
              <h2>
                Edit Look <Icon name="edit" />
              </h2>
              <button className="icon-button" aria-label="Close editor" onClick={() => setOpen(false)}>
                <Icon name="close" />
              </button>
            </div>
            <div className="editor-preview" style={zoomStyle(zoom)}>
              <LookPicture look={current} />
              <a className="mirror-fullscreen" href={link('try-on')} aria-label="Open in Styling Studio">
                <Icon name="fullscreen" />
              </a>
            </div>
            <h3>
              Look Items <span>({current.ids.length})</span>
            </h3>
            <div className="editor-items">
              {current.ids.map((id) => {
                const p = product(id);
                if (!p) return null;
                return (
                  <div key={id}>
                    <Art name={p.art} label={p.name} />
                    <span>{p.name}</span>
                    <button className="icon-button" aria-label={`Remove ${p.name}`} onClick={() => patch(edit, { ids: current.ids.filter((x) => x !== id) })}>
                      <Icon name="trash" />
                    </button>
                  </div>
                );
              })}
              <button
                className="button secondary"
                id="editInStudio"
                onClick={() => {
                  setSelected([...current.ids]);
                  navigate('try-on');
                }}
              >
                <Icon name="plus" /> Add Item
              </button>
            </div>
            <div className="editor-tabs">
              <span>
                <Icon name="sliders" /> Adjust
              </span>
              <span>
                <Icon name="looks" /> Background
              </span>
            </div>
            <label className="control-label" htmlFor="editorSize">
              Preview Size <output id="editorSizeValue">{zoom}%</output>
            </label>
            <input type="range" id="editorSize" min={100} max={150} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
            <label className="editor-name-label">
              Look Name
              <input id="editorName" className="field" maxLength={80} value={editing || ''} aria-label="Look name" onChange={(e) => setName(e.target.value)} />
            </label>
            <div className="editor-actions">
              <button
                className="button primary"
                id="saveLookChanges"
                onClick={() => {
                  const next = (name ?? current.name).trim();
                  if (!next) return toast('Give your look a name');
                  patch(edit, { name: next });
                  setName(null);
                  toast('Your look has been updated');
                }}
              >
                <Icon name="bookmark" /> Save Changes
              </button>
              <button className="button secondary" id="shareEditedLook" onClick={() => share(current)}>
                <Icon name="share" /> Share Look
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Icon name="looks" />
            <h2>Your Look Editor</h2>
            <p>Select a look to see its pieces.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

/** The design zooms the preview picture with the size slider. */
function zoomStyle(zoom: number) {
  return { '--zoom': zoom / 100 } as CSSProperties;
}
