import React, { useState, useEffect } from 'react';
import { getProjets, getModeles, getOutils, getRessources, getAcademie } from './services/airtable';
import Modal from './components/Modal';
import DoneView from './views/DoneView';
import KitView from './views/KitView';
import AcademieView from './views/AcademieView';
import { CheckCircle, LayoutGrid, Package } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('done');
  const [academieData, setAcademieData] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [outils, setOutils] = useState([]);
  const [ressources, setRessources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Tout');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [academieResults, modelesData, outilsData, ressourcesData] = await Promise.all([
          getAcademie(),
          getModeles(),
          getOutils(),
          getRessources()
        ]);
        setAcademieData(academieResults);
        setModeles(modelesData);
        setOutils(outilsData);
        setRessources(ressourcesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'done':
        return <DoneView />;
      case 'academie': {
        const categories = ['Tout', ...new Set(academieData.map(v => v.category).filter(Boolean))];
        const filteredData = selectedCategory === 'Tout'
          ? academieData
          : academieData.filter(v => v.category === selectedCategory);
        return (
          <div className="view-container tiktok-container fade-in">
            <header className="header academie-header">
              <div className="header-info">
                <h1 className="title">Académie.</h1>
                <p className="subtitle">Formations et pépites pour passer à l'action.</p>
              </div>
              <div className="academie-tags">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`academie-tag ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </header>
            <AcademieView data={filteredData} loading={loading} />
          </div>
        );
      }
      case 'kit':
        return <KitView 
          modeles={modeles} 
          outils={outils} 
          ressources={ressources} 
          loading={loading} 
        />;
      default:
        return null;
    }
  };

  return (
    <div className={`app-layout ${activeTab === 'academie' ? 'dark-mode' : ''}`}>
      {/* Navigation Desktop (Top) */}
      <nav className="desktop-nav">
        <div className="nav-container">
          <div className="nav-left">
            <div className="nav-logo">DoneApp</div>
          </div>
          
          <div className="nav-center">
            <div className="nav-links">
              <button 
                className={`nav-link ${activeTab === 'done' ? 'active' : ''}`}
                onClick={() => setActiveTab('done')}
              >
                Done
              </button>
              <button 
                className={`nav-link ${activeTab === 'academie' ? 'active' : ''}`}
                onClick={() => setActiveTab('academie')}
              >
                Academie
              </button>
              <button 
                className={`nav-link ${activeTab === 'kit' ? 'active' : ''}`}
                onClick={() => setActiveTab('kit')}
              >
                Kit
              </button>
            </div>
          </div>

          <div className="nav-right">
            {activeTab === 'done' && (
              <a 
                href="https://teamdemaa.fillout.com/comment-trouver-ses-premiers-clients" 
                target="_blank" 
                rel="noopener noreferrer"
                className="action-button"
              >
                Construire son plan d'action
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {renderContent()}
      </div>

      {/* Navigation Mobile (Bottom) */}
      <nav className="mobile-nav">
        <button 
          className={`mobile-nav-item ${activeTab === 'done' ? 'active' : ''}`}
          onClick={() => setActiveTab('done')}
        >
          <CheckCircle size={20} />
          <span>Done</span>
        </button>
        <button 
          className={`mobile-nav-item ${activeTab === 'academie' ? 'active' : ''}`}
          onClick={() => setActiveTab('academie')}
        >
          <LayoutGrid size={20} />
          <span>Academie</span>
        </button>
        <button 
          className={`mobile-nav-item ${activeTab === 'kit' ? 'active' : ''}`}
          onClick={() => setActiveTab('kit')}
        >
          <Package size={20} />
          <span>Kit</span>
        </button>
      </nav>

      <Modal 
        isOpen={selectedProject !== null} 
        onClose={() => setSelectedProject(null)} 
        project={selectedProject}
      />
    </div>
  );
}

export default App;
