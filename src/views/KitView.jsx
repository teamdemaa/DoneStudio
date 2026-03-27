import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './KitView.css';

const KitView = ({ modeles, outils, ressources, loading }) => {
  
  const HorizontalSection = ({ title, data, isModele }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth } = scrollRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    };

    return (
      <div className="kit-section">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <div className="scroll-controls">
            <button className="scroll-arrow" onClick={() => scroll('left')} aria-label="Défiler à gauche">
              <ChevronLeft size={20} />
            </button>
            <button className="scroll-arrow" onClick={() => scroll('right')} aria-label="Défiler à droite">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="horizontal-scroll" ref={scrollRef}>
          {data.map(item => (
            <div key={item.id} className={`kit-card ${isModele ? 'modele-card' : 'text-card'}`}>
              {isModele && item.images && item.images.length > 0 && (
                <div className="kit-card-image-container">
                  <img src={item.images[0]} alt={item.name} className="kit-card-img-fixed" />
                </div>
              )}
              
              <div className="kit-card-content">
                <span className="kit-tag">
                  {isModele ? (item.category || item.tool || 'Modèle') : (item.type || item.category || title.slice(0, -1))}
                </span>
                <h3 className="kit-card-title">{item.name}</h3>
                {item.description && !isModele && <p className="kit-card-desc">{item.description}</p>}
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="kit-card-link">
                  Accéder
                </a>
              </div>
            </div>
          ))}
          {data.length === 0 && <div className="empty-scroll">Aucun élément trouvé.</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="view-container kit-container fade-in">
      <header className="header">
        <h1 className="title">Kit.</h1>
        <p className="subtitle">Boîte à outils de l'entrepreneur.</p>
      </header>

      {loading ? (
        <div className="loading">Chargement des outils...</div>
      ) : (
        <div className="kit-content">
          <HorizontalSection title="Modèles" data={modeles} isModele={true} />
          <HorizontalSection title="Outils" data={outils} />
          <HorizontalSection title="Ressources" data={ressources} />
        </div>
      )}
    </div>
  );
};

export default KitView;
