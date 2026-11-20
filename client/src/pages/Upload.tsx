import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Sparkle } from '../components/Common';
import Icon from '../components/Icon';
import { CATEGORIES } from '../data/products';
import { useApp } from '../state/AppState';

type Result = { name: string; category: string; price: number };

export default function Upload() {
  const { toast } = useApp();
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const clear = () => {
    setUrl(null);
    setMessage('');
    setResult(null);
    if (input.current) input.current.value = '';
  };

  const choose = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clear();
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage('Choose a PNG, JPG or WEBP file under 5 MB.');
      return;
    }
    setUrl(URL.createObjectURL(file));
    setMessage(file.name);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url) return toast('Choose a product image first');
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name')).trim();
    if (!name) return;
    setResult({ name, category: String(data.get('category')), price: Number(data.get('price')) });
  };

  return (
    <section className="standard-page upload-page">
      <div className="page-heading">
        <div>
          <h1>
            AI Product Upload <Sparkle />
          </h1>
          <p>Your favorite pieces deserve a place in your look.</p>
        </div>
      </div>
      <div className="upload-layout">
        <div className="upload-card">
          <label className="upload-dropzone" htmlFor="imageUpload">
            <Icon name="upload" />
            <h2>Upload Product Image</h2>
            <p>Glasses, earrings, necklaces, makeup...</p>
            <span className="button primary small">
              <Icon name="camera" /> Choose Photo
            </span>
            <small>PNG, JPG or WEBP · Up to 5 MB</small>
          </label>
          <input id="imageUpload" ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={choose} />
          <div className="upload-preview" id="uploadPreviewWrap" hidden={!url}>
            <img
              id="uploadPreview"
              alt="Selected product"
              src={url ?? undefined}
              onError={() => {
                clear();
                setMessage('This image could not be opened. Choose another file.');
              }}
            />
            <button className="icon-button" id="clearUpload" aria-label="Remove selected image" onClick={clear}>
              <Icon name="close" />
            </button>
          </div>
          <p id="uploadMessage" className="form-status" role="status">
            {message}
          </p>
          <div className="classification">
            <h3>
              <Sparkle /> Prepare Your Product
            </h3>
            <p>Choose the category and details for your product preview.</p>
            <div className="classification-checks">
              <span id="checkImage" className={url ? 'complete' : undefined}>
                <Icon name="check" /> Product Image
              </span>
              <span id="checkDetails" className={result ? 'complete' : undefined}>
                <Icon name="check" /> Product Details
              </span>
              <span id="checkReady" className={result ? 'complete' : undefined}>
                <Icon name="check" /> Ready to Preview
              </span>
            </div>
          </div>
        </div>
        <form id="uploadForm" className="form-card" onSubmit={submit}>
          <h2>Product Information</h2>
          <label>
            Product Name
            <input className="field" name="name" required maxLength={100} placeholder="e.g. My favorite rose sunglasses" />
          </label>
          <label>
            Category
            <select className="field" name="category">
              {CATEGORIES.slice(1).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Price ($)
            <input className="field" type="number" min={0} step={0.01} name="price" required placeholder="49.00" />
          </label>
          <button className="button primary" type="submit">
            <Icon name="sparkles" /> Prepare Product
          </button>
          <p className="form-note">Preview only. Automatic classification and server uploads are not connected.</p>
          <div id="uploadResult" className="upload-result" role="status" hidden={!result}>
            {result && (
              <>
                <Icon name="check" />
                <strong>{result.name}</strong>
                <p>
                  {result.category} · ${result.price.toFixed(2)}
                </p>
                <small>Local preview ready. Your image stays on this device.</small>
              </>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
