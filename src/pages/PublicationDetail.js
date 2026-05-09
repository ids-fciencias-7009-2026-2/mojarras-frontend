import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { publicationService } from "../services/PublicationService";

const PublicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pub, setPub] = useState(null);
  const [error, setError] = useState("");
  const [interestMessage, setInterestMessage] = useState("");
  const [loadingInterest, setLoadingInterest] = useState(false);

  const loadPublication = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    const data = await publicationService.getPublication(token, id);
    setPub(data);
  }, [id]);

  useEffect(() => {
    const load = async () => {
      try { await loadPublication(); } catch (e) { setError(e.message); }
    };
    load();
  }, [loadPublication]);

  const handleMarkInterest = async () => {
    try {
      setLoadingInterest(true);
      setInterestMessage("");
      const token = sessionStorage.getItem("token");
      const response = await publicationService.markInterest(token, id);
      setInterestMessage(response.message || "¡Interés registrado exitosamente, revisa tu correo!");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingInterest(false);
    }
  };

  if (error) return <div className="page"><p className="error">{error}</p></div>;
  if (!pub) return <div className="page"><div className="home-loading"><span className="spinner" /> Cargando mascota...</div></div>;

  return (
    <div className="page page--detail">
      <div className="container publication-detail-shell">
        
        <div className="publication-detail-top" style={{ marginBottom: '20px' }}>
          <button className="ui-btn ui-btn--ghost" onClick={() => navigate("/home")} style={{ width: 'auto' }}>
            ← Volver al inicio
          </button>
        </div>

        <div className="detail-layout">
          <div className="detail-left">
            <div className="carousel-container">
              {pub.photos && pub.photos.length > 0 ? (
                pub.photos.map((photo, i) => (
                  <img 
                    key={photo.id || i} 
                    src={photo.url || photo} 
                    alt={pub.petName} 
                    className="carousel-img" 
                  />
                ))
              ) : (
                <div className="carousel-empty">{pub.type === "DOG" ? "🐶" : "🐱"}</div>
              )}
            </div>
          </div>

          <div className="detail-right">
            <span className="publication-card__tag" style={{ marginBottom: '10px', display: 'inline-block' }}>
              {pub.type === "DOG" ? "Perro" : "Gato"}
            </span>
            
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px', color: '#1f2937' }}>
              ¡Hola, soy {pub.petName}!
            </h1>
            
            <div className="publication-detail-meta" style={{ marginBottom: '20px', backgroundColor: '#f9fcff', padding: '10px 15px', borderRadius: '10px', border: '1px solid #e1eaf3' }}>
              <span><strong>Raza:</strong> {pub.breed || "Mestizo"}</span>
              <span style={{ marginLeft: '15px' }}><strong>C.P.:</strong> {pub.zipCode}</span>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: 'var(--primary-dark)' }}>Mi historia</h3>
              <p style={{ lineHeight: '1.6', color: '#5f6f82', whiteSpace: 'pre-line' }}>{pub.description}</p>
            </div>

            <div className="interest-section" style={{ border: '1px solid var(--primary-soft)', backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(245, 157, 48, 0.08)' }}>
              <h3 style={{ margin: '0 0 16px', color: '#1f2937' }}>¿Te gustaría adoptarme?</h3>
              
              <button 
                className="ui-btn ui-btn--primary" 
                onClick={handleMarkInterest} 
                disabled={loadingInterest}
                style={{ width: '100%', fontSize: '1.05rem', padding: '12px' }}
              >
                {loadingInterest ? "Procesando..." : " ¡Me interesa!"}
              </button>
              
              {interestMessage && <p className="success" style={{ marginTop: '16px', marginBottom: 0 }}>{interestMessage}</p>}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationDetail;