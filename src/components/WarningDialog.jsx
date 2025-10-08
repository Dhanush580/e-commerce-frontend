import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './WarningDialog.css';

const WarningDialog = ({ open, message, onClose }) => {
  if (!open) return null;

  const okRef = useRef(null);
  useEffect(() => {
    okRef.current?.focus();
  }, []);

  return createPortal(
    <div className="wdb-backdrop" role="dialog" aria-modal="true">
      <div className="wdb-dialog">
        <div className="wdb-header">Warning</div>
        <div className="wdb-message">{message}</div>
        <button ref={okRef} className="wdb-close" onClick={onClose}>OK</button>
      </div>
    </div>,
    document.body
  );
};

export default WarningDialog;