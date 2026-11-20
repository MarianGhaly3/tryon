import { useEffect, useRef, type FormEvent, type MouseEvent } from 'react';
import { useApp } from '../state/AppState';
import Icon from './Icon';

/** Native <dialog> that opens and closes with a prop and closes when the backdrop is clicked, like in the design. */
function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  const props = {
    ref,
    onClose,
    onClick: (e: MouseEvent<HTMLDialogElement>) => {
      if (e.target === ref.current) ref.current?.close();
    },
  };
  return props;
}

export function InfoDialog() {
  const { info, closeInfo } = useApp();
  const dialog = useDialog(Boolean(info), closeInfo);
  return (
    <dialog id="infoDialog" className="app-dialog" {...dialog}>
      <button className="dialog-close icon-button" aria-label="Close" onClick={closeInfo}>
        <Icon name="close" />
      </button>
      <h2 id="infoTitle">{info?.title}</h2>
      <div id="infoContent">{info?.body}</div>
      <button className="button primary" onClick={closeInfo}>
        Got It
      </button>
    </dialog>
  );
}

export function SaveLookDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (name: string) => void }) {
  const dialog = useDialog(open, onClose);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) {
      if (input.current) input.current.value = '';
      input.current?.focus();
    }
  }, [open]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const name = (input.current?.value ?? '').trim();
    if (name) onSave(name);
  };
  return (
    <dialog id="lookDialog" className="app-dialog" {...dialog}>
      <form id="saveLookForm" onSubmit={submit}>
        <button type="button" className="dialog-close icon-button" aria-label="Close" onClick={onClose}>
          <Icon name="close" />
        </button>
        <span className="eyebrow">MADE BY YOU</span>
        <h2>Save your signature look</h2>
        <p>A name for a look you'll love coming back to.</p>
        <label>
          Look Name
          <input ref={input} className="field" id="lookName" name="name" maxLength={80} required placeholder="e.g. My golden-hour look" />
        </label>
        <button className="button primary" type="submit">
          <Icon name="bookmark" /> Save Look
        </button>
      </form>
    </dialog>
  );
}

export function Toast() {
  const { message } = useApp();
  return (
    <div id="toast" className="toast" role="status" hidden={!message}>
      {message}
    </div>
  );
}
