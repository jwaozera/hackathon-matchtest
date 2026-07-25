import { useState } from 'react';
import './SubmitModal.css';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  timeRemaining: string;
  isSubmitting?: boolean;
}

export default function SubmitModal({ isOpen, onClose, onConfirm, timeRemaining, isSubmitting = false }: SubmitModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmed) {
      onConfirm();
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <div className="submit-modal__overlay" onClick={handleClose}>
      <div className="submit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="submit-modal__header">
          <span className="submit-modal__icon">🚀</span>
          <h2 className="submit-modal__title">Enviar Solução</h2>
        </div>

        <div className="submit-modal__body">
          <p className="submit-modal__message">
            Você está prestes a finalizar a simulação e enviar sua solução para avaliação.
          </p>

          <div className="submit-modal__info-grid">
            <div className="submit-modal__info-card">
              <span className="submit-modal__info-label">Tempo restante</span>
              <span className="submit-modal__info-value">{timeRemaining}</span>
            </div>
            <div className="submit-modal__info-card">
              <span className="submit-modal__info-label">O que será enviado</span>
              <span className="submit-modal__info-value submit-modal__info-value--small">Código + Histórico do Chat</span>
            </div>
          </div>

          <div className="submit-modal__warning">
            <span className="submit-modal__warning-icon">⚠️</span>
            <span className="submit-modal__warning-text">
              Esta ação não pode ser desfeita. Após o envio, a simulação será encerrada.
            </span>
          </div>

          <label className="submit-modal__checkbox-label">
            <input
              type="checkbox"
              className="submit-modal__checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span className="submit-modal__checkbox-custom" />
            <span className="submit-modal__checkbox-text">
              Confirmo que desejo enviar minha solução
            </span>
          </label>
        </div>

        <div className="submit-modal__footer">
          <button
            className="submit-modal__btn submit-modal__btn--cancel"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Voltar
          </button>
          <button
            className="submit-modal__btn submit-modal__btn--confirm"
            onClick={handleConfirm}
            disabled={!confirmed || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="submit-modal__btn-spinner" />
                Enviando...
              </>
            ) : (
              <>
                <span>🚀</span>
                Enviar Solução
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
