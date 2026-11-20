import { useEffect, useMemo, useRef, useState } from 'react';
import Art, { asset } from '../components/Art';
import { SaveLookDialog } from '../components/Dialogs';
import { FavoriteButton } from '../components/ProductCard';
import { SectionHeading, Sparkle } from '../components/Common';
import Icon, { categoryIcon } from '../components/Icon';
import { CATEGORIES, PRODUCTS, product } from '../data/products';
import { ADJUST_LIMITS, LIP_COLORS, PLACEMENT, TRYON } from '../data/tryon';
import { useCamera } from '../hooks/useCamera';
import { useFaceTracking } from '../hooks/useFaceTracking';
import { loadImage } from '../lib/images';
import { link, useRoute } from '../lib/router';
import type { FrameState, Worn } from '../lib/renderFrame';
import { download, takeSnapshot, thumbnail, toBlob } from '../lib/snapshot';
import { useApp } from '../state/AppState';
import { NO_ADJUST, type Adjust, type Category } from '../types';

const TABS = [
  ['Products', 'shop'],
  ['Makeup Studio', 'lips'],
  ['My Favorites', 'heart'],
] as const;
type Tab = (typeof TABS)[number][0];

const GLASSES_STYLES = ['All', 'Sunglasses', 'Eyeglasses', 'Cat Eye', 'Round', 'Aviator'];

export default function TryOn() {
  const { query } = useRoute();
  const { selected, selectProduct, removeSelected, favorites, addFavorites, saveLook, toast, showInfo } = useApp();

  const [category, setCategory] = useState<Category>(() => product(query.item)?.category ?? 'Glasses');
  const [tab, setTab] = useState<Tab>('Products');
  const [style, setStyle] = useState('All');
  const [settings, setSettings] = useState<Adjust>(NO_ADJUST);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recording, setRecording] = useState(false);
  const [notice, setNotice] = useState('Style preview · Choose pieces to build your look');

  const mirror = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const collection = useRef<HTMLElement>(null);
  const portrait = useRef<HTMLImageElement>(null);
  const accRef = useRef<HTMLCanvasElement>(null);
  const makeupRef = useRef<HTMLCanvasElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const camera = useCamera();
  const { live, videoRef, streamRef, error } = camera;

  // A product chosen elsewhere (Try On buttons) puts its category forward
  const item = query.item;
  useEffect(() => {
    const p = product(item);
    if (p) {
      setCategory(p.category);
      setTab(p.category === 'Makeup' ? 'Makeup Studio' : 'Products');
      setStyle('All');
      setSettings(NO_ADJUST);
    }
  }, [item]);

  // "Try On" buttons open the camera right away
  const auto = query.camera === '1';
  useEffect(() => {
    if (auto) void camera.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  // Cut-outs of the worn pieces, loaded once
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const wanted = useMemo(
    () =>
      selected
        .map((id) => TRYON[product(id)?.art ?? '']?.image)
        .filter((src): src is string => Boolean(src))
        .sort()
        .join('|'),
    [selected],
  );
  useEffect(() => {
    for (const src of wanted ? wanted.split('|') : []) {
      loadImage(src)
        .then((img) => setImages((prev) => (prev[src] ? prev : { ...prev, [src]: img })))
        .catch(() => undefined);
    }
  }, [wanted]);

  const adjustFor = (c: Category) => (c === category ? settings : NO_ADJUST);
  const frame = useMemo<FrameState>(() => {
    const worn: Worn = {};
    const state: FrameState = { worn, makeup: {} };
    for (const id of selected) {
      const p = product(id);
      if (!p) continue;
      const adj = p.category === category ? settings : NO_ADJUST;
      if (p.category === 'Makeup') {
        const color = LIP_COLORS[id];
        if (color) state.makeup.lipstick = { color, alpha: 0.7 * (adj.opacity / 100) };
        continue;
      }
      const t = TRYON[p.art];
      const img = t && images[t.image];
      if (t && img) worn[t.kind] = { fit: t.fit, img, adj, anchorX: t.anchorX };
    }
    return state;
  }, [selected, images, category, settings]);

  const { status, face } = useFaceTracking(live, videoRef, accRef, makeupRef, frame);

  useEffect(() => {
    if (error) setNotice(error);
  }, [error]);
  useEffect(() => {
    if (!live) return;
    if (status === 'loading') setNotice('Getting your preview ready · Face tracking is loading');
    else if (status === 'failed') setNotice('Manual placement · Use the controls to adjust accessories');
    else if (face) setNotice('Face tracking on · Pieces follow your face');
    else if (status === 'ready') setNotice('Looking for your face · Center it in the frame');
  }, [live, status, face]);

  const stopCamera = () => {
    if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop();
    camera.stop();
    setNotice('Camera off · Your styled preview is ready');
  };

  const pick = (id: number) => {
    const p = product(id);
    if (!p) return;
    selectProduct(id);
    setCategory(p.category);
  };

  const pickCategory = (c: Category) => {
    setCategory(c);
    setStyle('All');
    setTab(c === 'Makeup' ? 'Makeup Studio' : 'Products');
    setSettings(NO_ADJUST);
  };

  const pickTab = (t: Tab) => {
    setTab(t);
    setStyle('All');
    if (t === 'Makeup Studio') setCategory('Makeup');
    else if (category === 'Makeup') setCategory('Glasses');
  };

  const set = (key: keyof Adjust, value: number) => setSettings((s) => ({ ...s, [key]: value }));
  const move = (dir: 'up' | 'down' | 'left' | 'right') =>
    setSettings((s) => {
      const key = dir === 'up' || dir === 'down' ? 'y' : 'x';
      const step = dir === 'up' || dir === 'left' ? -2 : 2;
      return { ...s, [key]: Math.max(-40, Math.min(40, s[key] + step)) };
    });
  const reset = () => setSettings(NO_ADJUST);

  const styles =
    category === 'Glasses' ? GLASSES_STYLES : ['All', ...new Set(PRODUCTS.filter((p) => p.category === category).map((p) => p.style))];
  let items = PRODUCTS.filter((p) => (tab === 'My Favorites' ? favorites.includes(p.id) : p.category === category));
  if (style !== 'All') {
    items = items.filter((p) => (style === 'Sunglasses' ? p.category === 'Glasses' && p.style !== 'Eyeglasses' : p.style === style));
  }

  const photo = (tracked: boolean) => {
    if (!mirror.current || !portrait.current) throw new Error('The preview is not ready.');
    return takeSnapshot({
      box: mirror.current,
      video: videoRef.current,
      image: portrait.current,
      live,
      accessories: accRef.current,
      makeup: makeupRef.current,
      tracked,
      selected,
      category,
      adjust: settings,
    });
  };

  const capture = async () => {
    try {
      const canvas = await photo(face);
      download(await toBlob(canvas), 'eclat-my-look.png');
      toast('Your photo is ready');
    } catch {
      toast('Could not export the photo. Try opening the app on localhost.');
    }
  };

  const record = () => {
    const stream = streamRef.current;
    if (!stream) return toast('Enable the camera first to record a video');
    if (typeof MediaRecorder === 'undefined') return toast('Video recording is not available in this browser');
    if (recorder.current?.state === 'recording') {
      recorder.current.stop();
      return;
    }
    try {
      const chunks: Blob[] = [];
      const r = new MediaRecorder(stream);
      recorder.current = r;
      r.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      r.onstop = () => {
        download(new Blob(chunks, { type: r.mimeType }), 'eclat-camera-video.webm');
        setRecording(false);
        toast('Camera video saved (without accessory overlays)');
      };
      r.start();
      setRecording(true);
      toast('Recording camera video · Tap again to save');
    } catch {
      toast('Video recording is not supported by this camera');
    }
  };

  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await mirror.current?.requestFullscreen();
    } catch {
      toast('Fullscreen is not supported in this preview');
    }
  };

  const share = async () => {
    const names = selected.map((id) => product(id)?.name).join(', ');
    const text = `My ÉCLAT look: ${names}`;
    try {
      if (navigator.share) await navigator.share({ title: 'My ÉCLAT Look', text });
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast('Look details copied to clipboard');
      } else {
        showInfo('Share Your Look', <p>{text}</p>);
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) showInfo('Share Your Look', <p>{text}</p>);
    }
  };

  const openSave = () => {
    if (!selected.length) return toast('Choose a piece before saving your look');
    setSaving(true);
  };

  const save = async (name: string) => {
    let image: string | undefined;
    if (live) {
      try {
        image = thumbnail(await photo(face));
      } catch {
        image = undefined;
      }
    }
    const ok = saveLook({ name, ids: [...selected], art: 'look1', photo: image, settings: { ...settings } });
    setSaving(false);
    toast(ok ? 'Your look is saved in My Looks' : 'Look saved for this session. Browser storage is unavailable.');
  };

  return (
    <div className="studio-layout">
      <aside className="studio-sidebar">
        <div>
          <h1>
            Styling Studio <Sparkle />
          </h1>
          <p>
            Try, mix and match your favorite
            <br />
            accessories and makeup
          </p>
        </div>
        <div className="studio-categories">
          {CATEGORIES.slice(1).map((c) => (
            <button key={c} className={`studio-category ${c === category ? 'active' : ''}`.trim()} onClick={() => pickCategory(c as Category)}>
              <Icon name={categoryIcon(c)} />
              {c}
            </button>
          ))}
        </div>
        <div className={`studio-controls ${controlsOpen ? 'expanded' : ''}`.trim()} id="studioControls" ref={controls}>
          <h3>Adjust Selected Item</h3>
          <label className="control-label" htmlFor="sizeControl">
            Size <output id="sizeValue">{settings.size}%</output>
          </label>
          <input id="sizeControl" type="range" min={ADJUST_LIMITS.size[0]} max={ADJUST_LIMITS.size[1]} value={settings.size} onChange={(e) => set('size', Number(e.target.value))} />
          <div className="position-control">
            <span>Position</span>
            <div>
              {(
                [
                  ['up', '↑'],
                  ['down', '↓'],
                  ['left', '←'],
                  ['right', '→'],
                ] as const
              ).map(([dir, label]) => (
                <button key={dir} className="position-button" aria-label={`Move ${dir}`} onClick={() => move(dir)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="control-label" htmlFor="rotationControl">
            Rotation <output id="rotationValue">{settings.rotation}°</output>
          </label>
          <input id="rotationControl" type="range" min={ADJUST_LIMITS.rotation[0]} max={ADJUST_LIMITS.rotation[1]} value={settings.rotation} onChange={(e) => set('rotation', Number(e.target.value))} />
          <label className="control-label" htmlFor="opacityControl">
            Opacity <output id="opacityValue">{settings.opacity}%</output>
          </label>
          <input id="opacityControl" type="range" min={ADJUST_LIMITS.opacity[0]} max={ADJUST_LIMITS.opacity[1]} value={settings.opacity} onChange={(e) => set('opacity', Number(e.target.value))} />
          <button
            className="button secondary reset-button"
            id="resetControls"
            onClick={() => {
              reset();
              toast('Adjustments reset');
            }}
          >
            <Icon name="reset" /> Reset
          </button>
          <details className="preview-help">
            <summary>About the preview</summary>
            <p>Enable your camera and the pieces follow your face. If your face can't be found, place them by hand with these controls. Without the camera you see the styled reference photo.</p>
          </details>
        </div>
      </aside>

      <section className="studio-center">
        <div className="studio-mirror" id="studioMirror" ref={mirror}>
          <img ref={portrait} id="previewImage" className="mirror-image" src={asset('studio-portrait.webp')} alt="Styled preview wearing rose sunglasses and gold jewelry" hidden={live} />
          <video id="cameraVideo" ref={videoRef} autoPlay muted playsInline hidden={!live} />
          <canvas ref={makeupRef} className="tryon-layer tryon-makeup" aria-hidden="true" hidden={!live} />
          <canvas ref={accRef} className="tryon-layer" aria-hidden="true" hidden={!live} />
          <div id="manualOverlays" className="manual-overlays" hidden={!live || face}>
            {selected.map((id) => {
              const p = product(id);
              if (!p) return null;
              const pos = PLACEMENT[p.category];
              const s = adjustFor(p.category);
              return (
                <div
                  key={id}
                  className="accessory-overlay"
                  style={{
                    left: `${pos.x + s.x}%`,
                    top: `${pos.y + s.y}%`,
                    width: `${(pos.w * s.size) / 100}%`,
                    opacity: s.opacity / 100,
                    transform: `translate(-50%,-50%) rotate(${s.rotation}deg)`,
                  }}
                >
                  <Art name={p.category === 'Makeup' ? 'lips' : p.art} />
                </div>
              );
            })}
          </div>
          <span id="cameraStatus" className="camera-status">
            <i className={live ? 'live' : undefined} /> {live ? 'Live Try-On' : 'Style Preview'}
          </span>
          <button className="mirror-fullscreen" id="fullscreenPreview" aria-label="Expand preview" onClick={fullscreen}>
            <Icon name="fullscreen" />
          </button>
          <div className="mirror-tools">
            <button id="switchCamera" aria-label="Enable or switch camera" title="Enable or switch camera" onClick={() => (live ? void camera.flip() : void camera.start())}>
              <Icon name="reset" />
            </button>
            <button id="capturePhoto" aria-label="Capture photo" title="Capture photo" onClick={() => void capture()}>
              <Icon name="camera" />
            </button>
            <button id="recordVideo" className={recording ? 'recording' : undefined} aria-label="Record video" title="Record video" onClick={record}>
              <Icon name="video" />
            </button>
            <button
              id="adjustToggle"
              aria-label="Adjust selected item"
              title="Adjust selected item"
              onClick={() => {
                setControlsOpen((o) => !o);
                controls.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }}
            >
              <Icon name="settings" />
            </button>
          </div>
          <div className="look-tray">
            <strong>Your Look</strong>
            <div id="selectedItems">
              {selected.length ? (
                selected.map((id) => {
                  const p = product(id);
                  if (!p) return null;
                  const current = p.category === category;
                  return (
                    <div key={id} className={`selected-item ${current ? 'current' : ''}`.trim()}>
                      <button aria-label={`Adjust ${p.name}`} onClick={() => pick(id)}>
                        <Art
                          name={p.art}
                          label={p.name}
                          style={current ? { transform: `scale(${settings.size / 100}) rotate(${settings.rotation}deg)`, opacity: settings.opacity / 100 } : undefined}
                        />
                      </button>
                      <button className="remove-item" aria-label={`Remove ${p.name}`} onClick={() => removeSelected(id)}>
                        <Icon name="close" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <span className="empty-tray">Choose a piece you love</span>
              )}
            </div>
            <button
              className="add-item-button"
              id="addStudioItem"
              aria-label="Add an item"
              onClick={() => {
                collection.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                collection.current?.querySelector<HTMLButtonElement>('.studio-product button')?.focus({ preventScroll: true });
              }}
            >
              <Icon name="plus" />
            </button>
          </div>
        </div>
        <div className="studio-actions">
          <button className="button secondary" id="saveLook" onClick={openSave}>
            <Icon name="download" /> Save Look
          </button>
          <button className="button secondary" id="shareLook" onClick={() => void share()}>
            <Icon name="share" /> Share
          </button>
          <button
            className="button primary"
            id="favoriteLook"
            onClick={() => {
              addFavorites(selected);
              toast('Your look’s pieces were added to favorites');
            }}
          >
            <Icon name="heart" /> Add to Favorites
          </button>
        </div>
        <div className="camera-caption">
          <button className="text-button" id="startCamera" hidden={live} onClick={() => void camera.start()}>
            <Icon name="camera" /> Enable Camera
          </button>
          <button className="text-button" id="stopCamera" hidden={!live} onClick={stopCamera}>
            Stop Camera
          </button>
          <p id="cameraMessage" role="status">
            {notice}
          </p>
        </div>
      </section>

      <aside className="studio-collection" ref={collection}>
        <div className="studio-tabs" role="tablist" aria-label="Studio collections">
          {TABS.map(([t, i]) => (
            <button key={t} role="tab" aria-selected={t === tab} className={t === tab ? 'active' : ''} onClick={() => pickTab(t)}>
              <Icon name={i} />
              <span>{t}</span>
            </button>
          ))}
        </div>
        <div className="studio-collection-heading">
          <h2 id="studioCollectionTitle">{tab === 'My Favorites' ? 'Your Favorite Pieces' : `${category} Collection`}</h2>
          <a href={link('shop')}>
            View All <Icon name="arrow" />
          </a>
        </div>
        <div id="studioStyleFilters" className="style-filters">
          {styles.map((s) => (
            <button key={s} className={`pill ${s === style ? 'active' : ''}`.trim()} aria-pressed={s === style} onClick={() => setStyle(s)}>
              {s}
            </button>
          ))}
        </div>
        <div id="studioProducts" className="studio-product-grid">
          {items.length ? (
            items.slice(0, 8).map((p) => {
              const on = selected.includes(p.id);
              return (
                <div key={p.id} className={`studio-product ${on ? 'selected' : ''}`.trim()}>
                  <button aria-label={`Try ${p.name}`} aria-pressed={on} onClick={() => pick(p.id)}>
                    <Art name={p.art} label={p.name} />
                    <span className="studio-product-name">{p.name}</span>
                  </button>
                  <FavoriteButton p={p} />
                  {on && (
                    <span className="selection-check">
                      <Icon name="check" />
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <p className="studio-empty">{tab === 'My Favorites' ? 'Tap a heart to add your favorite pieces here.' : 'No pieces in this style yet.'}</p>
          )}
        </div>
        <section className="recommendations">
          <SectionHeading
            title={
              <>
                Recommended for You <Sparkle />
              </>
            }
          />
          <div className="recommended-grid">
            {[3, 4, 5].map((id) => {
              const p = product(id);
              if (!p) return null;
              return (
                <div key={id} className="studio-product recommendation">
                  <button aria-label={`Add ${p.name}`} onClick={() => pick(id)}>
                    <Art name={p.art} label={p.name} />
                  </button>
                  <FavoriteButton p={p} />
                </div>
              );
            })}
          </div>
        </section>
      </aside>

      <SaveLookDialog open={saving} onClose={() => setSaving(false)} onSave={(n) => void save(n)} />
    </div>
  );
}
