import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { publicationService } from "../services/PublicationService";
import BreedAutocomplete from "../components/BreedAutocomplete";
import Toast from "../components/Toast";

const EditPublication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    petName: "",
    description: "",
    type: "DOG",
    breed: "",
    zipCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadPublication = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const data = await publicationService.getPublication(token, id);
        setForm({
          petName: data.petName || "",
          description: data.description || "",
          type: data.type || "DOG",
          breed: data.breed || "",
          zipCode: data.zipCode || "",
        });
        const normalized = (data.photos || []).map((p, i) =>
          typeof p === "string"
            ? { id: null, url: p, _key: `legacy-${i}` }
            : { ...p, _key: p.id ?? `legacy-${i}` },
        );
        setPhotos(normalized);
      } catch (err) {
        setError("No se pudo cargar la información de la mascota.");
      } finally {
        setFetching(false);
      }
    };
    loadPublication();
  }, [id]);

  const handleDeletePhoto = async (photo) => {
    if (photo.id == null) {
      setToast({
        type: "warning",
        message: "Esta foto no se puede eliminar (publicación antigua).",
      });
      return;
    }
    if (
      !window.confirm("¿Eliminar esta foto? Esta acción no se puede deshacer.")
    )
      return;

    setDeletingId(photo.id);
    setToast(null);
    try {
      const token = sessionStorage.getItem("token");
      await publicationService.deletePhoto(token, id, photo.id);
      setPhotos((current) => current.filter((p) => p.id !== photo.id));
      setToast({ type: "success", message: "Foto eliminada correctamente." });
    } catch (err) {
      setToast({ type: "error", message: "No pudimos eliminar la foto." });
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      await publicationService.updatePublication(token, id, form);
      navigate("/my-publications");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="page">
        <div className="home-loading">
          <span className="spinner" /> Cargando datos...
        </div>
      </div>
    );

  return (
    <div className="page page--form">
      <div className="container auth-card publication-form-card">
        <div className="publication-form-header">
          <div>
            <h2>Editar Publicación</h2>
            <p className="auth-subtitle">
              Modifica los datos de tu mascota y guarda los cambios.
            </p>
          </div>
          <button
            className="ui-btn ui-btn--ghost"
            type="button"
            onClick={() => navigate("/my-publications")}
          >
            Cancelar
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="stack-form">
          <div className="field-group">
            <label className="ui-label">Nombre de la mascota</label>
            <input
              name="petName"
              value={form.petName}
              onChange={handleChange}
              required
              className="ui-input"
            />
          </div>

          <div className="field-group">
            <label className="ui-label">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              minLength={10}
              required
              className="ui-input publication-textarea"
            />
          </div>

          <div className="field-row">
            <div className="field-group">
              <label className="ui-label">Tipo</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="ui-input"
              >
                <option value="DOG">Perro</option>
                <option value="CAT">Gato</option>
              </select>
            </div>
            <div className="field-group">
              <label className="ui-label">Código Postal</label>
              <input
                name="zipCode"
                value={form.zipCode}
                onChange={handleChange}
                required
                className="ui-input"
              />
            </div>
          </div>

          <div className="field-group">
            <label className="ui-label">Raza</label>
            <BreedAutocomplete
              type={form.type}
              value={form.breed}
              onChange={handleChange}
            />
          </div>

          <div className="stack-actions" style={{ marginTop: "20px" }}>
            <button
              className="ui-btn ui-btn--primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>

        <div className="field-group photo-manager">
          <label className="ui-label">Fotos de la publicación</label>
          {photos.length === 0 ? (
            <p className="photo-manager__empty">
              Esta publicación no tiene fotos.
            </p>
          ) : (
            <div className="photo-manager__grid">
              {photos.map((photo) => (
                <div key={photo._key} className="photo-manager__item">
                  <img
                    src={photo.url}
                    alt={form.petName}
                    className="photo-manager__img"
                  />
                  <button
                    type="button"
                    className="ui-btn ui-btn--ghost ui-btn--danger ui-btn--dense photo-manager__delete"
                    onClick={() => handleDeletePhoto(photo)}
                    disabled={deletingId === photo.id}
                  >
                    {deletingId === photo.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default EditPublication;
