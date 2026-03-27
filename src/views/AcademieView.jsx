import React, { useState, useEffect, useRef } from 'react';
import './AcademieView.css';

const AcademieView = ({ data, loading }) => {
  const [activeId, setActiveId] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const options = {
      root: containerRef.current,
      threshold: 0.7,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.dataset.id);
        }
      });
    }, options);

    const cards = document.querySelectorAll('.tiktok-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [data, loading]);

  if (loading) return <div className="loading">Chargement de l'Académie...</div>;

  return (
    <div className="tiktok-feed fade-in" ref={containerRef}>
      {data.map((item) => (
        <div key={item.id} className="tiktok-card" data-id={item.id}>
          <div className="video-container">
            {activeId === item.id && item.videoUrl ? (
              <iframe
                className="embedded-video"
                src={`${getEmbedUrl(item.videoUrl)}&autoplay=1`}
                title={item.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="video-placeholder">
                <div className="play-overlay">
                  <div className="play-button">▶</div>
                </div>
              </div>
            )}
            
            <div className="video-overlay">
              <div className="video-info">
                <span className="video-category">{item.category}</span>
                <h2 className="video-title">{item.name}</h2>
                <p className="video-desc">{item.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
      {data.length === 0 && <div className="empty-state">Aucun contenu trouvé dans l'Académie.</div>}
    </div>
  );
};

// Helper to convert typical video links to embed links
const getEmbedUrl = (url) => {
  if (!url) return '';
  let videoId = '';
  
  if (url.includes('youtube.com/shorts/')) {
    videoId = url.split('shorts/')[1]?.split('?')[0];
  } else if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('be/')[1]?.split('?')[0];
  } else if (url.includes('loom.com')) {
    videoId = url.split('/').pop();
    return `https://www.loom.com/embed/${videoId}?autoplay=1`;
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }
  
  return url;
};

export default AcademieView;
