import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicationService } from "../services/PublicationService";

const MyPublications = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para manejar qué lista de interesados estamos viendo
  const [showInterestedFor, setShowInterestedFor] = useState(null); 
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [loadingInt, setLoadingInt] = useState(false);

  const navigate = useNavigate();

  const loadMyData = async () => {
    const token = sessionStorage.getItem("token");
    setLoading(true);
    try {
      const data = await publicationService.listMyPublications(token, { size: 50, sort: "id,desc" });
      setPublications(data.content || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { loadMyData(); }, []);

  const handleShowInterested = async (id) => {
    if (showInterestedFor === id) {
      setShowInterestedFor(null);
      return;
    }
    setLoadingInt(true);
    try {
      const token = sessionStorage.getItem("token");
      const users = await publicationService.getInterested(token, id);
      setInterestedUsers(users);
      setShowInterestedFor(id);
    } catch (err) { alert(err.message); } finally { setLoadingInt(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar a ${name}?`)) return;
    try {
      await publicationService.deletePublication(sessionStorage.getItem("token"), id);
      loadMyData();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="home-loading"><span className="spinner" /> Cargando...</div>;

  return (
    <div className="page page--list">
      <div className="container publications-shell">
        <div className="publication-detail-top" style={{ marginBottom: '20px' }}>
          <button className="ui-btn ui-btn--ghost" onClick={() => navigate("/profile")} style={{ width: 'auto' }}>
            ← Volver al Perfil
          </button>
        </div>

        <h2>Mis Mascotas en Adopción</h2>

        <div className="publications-grid">
          {publications.map((pub) => (
            <div key={pub.id} className="publication-card" style={{ padding: 0, overflow: 'hidden', cursor: 'default' }}>
              <div style={{ width: '100%', height: '160px', backgroundColor: '#e4ecf4' }}>
                {pub.thumbnail && <img src={pub.thumbnail} alt={pub.petName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              
              <div style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 10px' }}>{pub.petName}</h3>
                
                <button 
                  className="ui-btn ui-btn--primary" 
                  style={{ marginBottom: '10px', fontSize: '0.85rem', background: 'var(--primary-dark)' }}
                  onClick={() => handleShowInterested(pub.id)}
                >
                  {showInterestedFor === pub.id ? "▲ Ocultar interesados" : " Ver interesados"}
                </button>

                {showInterestedFor === pub.id && (
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                    {loadingInt ? "Cargando..." : interestedUsers.length === 0 ? "Nadie interesado aún 💔" : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {interestedUsers.map(u => (
                          <li key={u.id} style={{ borderBottom: '1px solid #edf2f7', padding: '4px 0' }}>
                            <strong>{u.username}</strong><br/>{u.email}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="ui-btn ui-btn--ghost" style={{ flex: 1, margin: 0 }} onClick={() => navigate(`/publications/${pub.id}/edit`)}> Editar</button>
                  <button className="ui-btn ui-btn--ghost" style={{ flex: 1, margin: 0, color: 'var(--danger)' }} onClick={() => handleDelete(pub.id, pub.petName)}> Borrar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPublications;