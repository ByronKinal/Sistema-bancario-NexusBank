import React, { useState, useEffect } from 'react';
import '../../styles/confirmModal.css';

const ConfirmModal = ({
  open,
  title = 'Confirmar',
  message = '¿Estás seguro?',
  onConfirm = (value) => {},
  onCancel = () => {},
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showInput = false,
  inputPlaceholder = '',
  inputInitialValue = '',
}) => {
  const [inputValue, setInputValue] = useState(inputInitialValue);

  useEffect(() => {
    setInputValue(inputInitialValue || '');
  }, [inputInitialValue, open]);

  if (!open) return null;

  return (
    <div className="cb-modal-overlay" role="dialog" aria-modal="true">
      <div className="cb-modal">
        <div className="cb-modal-header">
          <h3 className="cb-modal-title">{title}</h3>
        </div>

        <div className="cb-modal-body">
          <p className="cb-modal-message">{message}</p>
          {showInput && (
            <textarea
              className="cb-modal-input"
              placeholder={inputPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          )}
        </div>

        <div className="cb-modal-footer">
          <button className="cb-btn cb-btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="cb-btn cb-btn-confirm" onClick={() => onConfirm(inputValue)}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
