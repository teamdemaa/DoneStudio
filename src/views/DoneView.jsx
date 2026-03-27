import React, { useState } from 'react';
import { generateGTMStrategy } from '../services/gemini';
import { saveGeneration } from '../services/airtable';
import { Printer, Download, Share2, RefreshCw, CheckCircle } from 'lucide-react';
import './DoneView.css';

const DoneView = () => {
  const [project, setProject] = useState('');
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project.trim()) return;
    setLoading(true);
    setError(null);
    setStrategy(null);
    setIsSaved(false);

    try {
      const result = await generateGTMStrategy(project);
      setStrategy(result);
      
      // Sauvegarde automatique sur Airtable
      try {
        await saveGeneration(project, result);
        setIsSaved(true);
      } catch (saveErr) {
        console.warn('Échec de la sauvegarde sur Airtable:', saveErr);
        // On ne bloque pas l'utilisateur si la sauvegarde échoue
      }
    } catch (err) {
      setError("Une erreur s'est produite. Vérifie ta connexion et réessaie.");
      console.error(err);
    }
    setLoading(false);
  };

  const handleRegenerate = () => {
    setStrategy(null);
    setIsSaved(false);
    setError(null);
    // On garde le projet dans le champ pour correction
  };

  const handleExportCSV = () => {
    if (!strategy) return;
    let csvContent = "data:text/csv;charset=utf-8,Pilier,Point,Contenu\n";
    strategy.columns.forEach(col => {
      col.cards.forEach(card => {
        const row = [
          `"${col.title.replace(/"/g, '""')}"`,
          `"${card.title.replace(/"/g, '""')}"`,
          `"${card.content.replace(/"/g, '""')}"`
        ].join(",");
        csvContent += row + "\n";
      });
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GTM_Strategie_${project.replace(/\s+/g, '_').substring(0, 20)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `Ma Stratégie GTM pour ${project}\n\n${JSON.stringify(strategy, null, 2)}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Stratégie copiée dans le presse-papier !');
    });
  };

  return (
    <div className="view-container fade-in">
      <div className="done-hero">
        Décris ton projet,<br/>je te génère une <em>Stratégie</em>
      </div>

      {!strategy && (
        <div className="gtm-chat-section">
          <form className="gtm-form" onSubmit={handleSubmit}>
            <div className="gtm-input-wrapper">
              <textarea
                className="gtm-input"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Décris ton projet : secteur, cible, offre, stade actuel…"
                rows={4}
                disabled={loading}
              />
              <button
                type="submit"
                className="gtm-submit"
                disabled={loading || !project.trim()}
                title="Générer ma stratégie"
              >
                {loading
                  ? <span className="spinner"></span>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                }
              </button>
            </div>
          </form>

          {error && (
            <div className="gtm-error">{error}</div>
          )}
        </div>
      )}

      {/* Toolbar - Discrète */}
      {strategy && !loading && (
        <div className="gtm-toolbar fade-in">
          <div className="toolbar-left">
            <h3>{project}</h3>
            {isSaved && <span className="save-badge"><CheckCircle size={14} /> Sauvegardé</span>}
          </div>
          <div className="toolbar-actions">
            <button className="icon-btn" onClick={handlePrint} title="Imprimer en PDF">
              <Printer size={18} />
            </button>
            <button className="icon-btn" onClick={handleExportCSV} title="Exporter en CSV">
              <Download size={18} />
            </button>
            <button className="icon-btn" onClick={handleShare} title="Partager">
              <Share2 size={18} />
            </button>
            <button className="icon-btn highlight" onClick={handleRegenerate} title="Nouvelle génération">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Kanban Output */}
      {loading && (
        <div className="gtm-loading-state">
          <div className="gtm-skeleton-kanban">
            {[1, 2, 3].map(i => (
              <div key={i} className="gtm-skeleton-col">
                <div className="skeleton-line" style={{width: '60%', height: '20px', marginBottom: '24px'}}></div>
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="gtm-skeleton-card">
                    <div className="skeleton-line" style={{width: '70%', height: '14px', marginBottom: '8px'}}></div>
                    <div className="skeleton-line" style={{width: '100%', height: '12px', marginBottom: '4px'}}></div>
                    <div className="skeleton-line short" style={{height: '12px'}}></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {strategy && !loading && (
        <div className="gtm-kanban fade-in">
          {strategy.columns.map((col) => (
            <div key={col.id} className="gtm-column">
              <h2 className="gtm-column-title">{col.title}</h2>
              <div className="gtm-cards">
                {col.cards.map((card) => (
                  <div key={card.id} className="gtm-card">
                    <h3 className="gtm-card-title">{card.title}</h3>
                    <p className="gtm-card-content">{card.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default DoneView;
