import React, { useEffect, useState } from 'react';
import './Dialog.css';

function Dialog({ dialog, setDialog }) {
  const [value, setValue] = useState(dialog?.defaultValue || '');

  useEffect(() => {
    setValue(dialog?.defaultValue || '');
  }, [dialog]);

  if (!dialog) return null;

  const close = () => setDialog(null);

  const handleConfirm = async () => {
    try {
      if (dialog.onConfirm) {
        // pass prompt value for prompt type
        if (dialog.type === 'prompt') await dialog.onConfirm(value);
        else await dialog.onConfirm();
      }
    } catch (e) {
      console.error('Dialog onConfirm error', e);
    }
    close();
  };

  return (
    <div className="dialog-overlay" onClick={close}>
      <div className="dialog-popup" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {dialog.title && <div className="dialog-title">{dialog.title}</div>}
        {dialog.message && <div className="dialog-message">{dialog.message}</div>}

        {dialog.type === 'prompt' && (
          <input className="dialog-input" value={value} onChange={e => setValue(e.target.value)} />
        )}

        <div className="dialog-actions">
          {dialog.type === 'confirm' || dialog.type === 'prompt' ? (
            <>
              <button className="btn outline" onClick={close}>Cancel</button>
              <button className="btn primary" onClick={handleConfirm}>Confirm</button>
            </>
          ) : (
            <button className="btn primary" onClick={handleConfirm}>OK</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dialog;
