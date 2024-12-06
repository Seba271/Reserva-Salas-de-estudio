import React from 'react';
import './Modal.css';

interface ModalProps {
  show: boolean;
  className: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, className, children }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${className}`}>
        <button className="modal-close" onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  );
};

export default Modal; 