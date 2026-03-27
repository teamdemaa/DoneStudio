import React from 'react';
import { X } from 'lucide-react';
import './Modal.css';

const Modal = ({ isOpen, onClose, project }) => {
  if (!isOpen || !project) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="modal-body">
          <span className="project-category-tag">{project.category}</span>
          <h2 className="modal-title">{project.name}</h2>
          
          <div className="modal-info">
            <div className="info-item">
              <span className="info-label">Statut</span>
              <span className="info-value">{project.status || 'Non défini'}</span>
            </div>
          </div>

          <p className="modal-description">{project.description || 'Pas de description disponible.'}</p>

          {project.link && (
            <a 
              href={project.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="modal-button"
            >
              Rejoindre le projet
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
