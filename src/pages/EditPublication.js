import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { photosApi, publicationsApi } from "../services/api";
import BreedAutocomplete from "../components/BreedAutocomplete";
import Toast from "../components/Toast";

const MAX_FILE_MB = 5;
const MAX_TOTAL = 8;

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
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadPublication = async () => {
      try {
        const data = await publicationsApi.get(id);
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
      } catch (_err) {
        setError("No se pudo cargar la información de la mascota.");
      } finally {
        setFetching(false);
      }
    };
    loadPublication();
  }, [id]);

  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setNewPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newFiles]);

  const handleDeletePhoto = async (photo) => {
    if (photo.id == null) {
      setToast({
        type: "warning",
        message: "Esta foto no se puede eliminar (publicación antigua).",
      });
      return;
    }
    if (!window.confirm("¿Eliminar esta foto? Esta acción no se puede deshacer.")) return;

    setDeletingId(photo.id);
    setToast(null);
    try {
      await photosApi.remove(id, photo.id);
      setPhotos((current) => current.filter((p) => p.id !== photo.id));
      setToast({ type: "success", message: "Foto eliminada correctamente." });
    } catch (_err) {
      setToast({ type: "error", message: "No pudimos eliminar la foto." });
    } finally {
      setDeletingId(null);
    }
  };

  const addNewFiles = (incoming) => {
    const slotsLeft = MAX_TOTAL - photos.length - newFiles.length;
    if (slotsLeft <= 0) {
      setToast({ type: "warning", message: `Máximo ${MAX_TOTAL} fotos.` });
      return;
    }
    const valid = [];
    let rejected = 0;
    Array.from(incoming).forEach((f) => {
      if (!f.type.startsWith("image/") || f.size > MAX_FILE_MB * 1024 * 1024) {
        rejected += 1;
        return;
      }
      valid.push(f);
    });
    if (rejected) {
      setToast({
        type: "warning",
        message: `${rejected} archivo(s) ignorados (formato o tamaño).`,
      });
    }
    setNewFiles((cur) => [...cur, ...valid].slice(0, slotsLeft));
  };

  const removeNewFile = (idx) => {
    setNewFiles((cur) => cur.filter((_, i) => i !== idx));
  };

  const handleUploadNew = async () => {
    if (newFiles.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await photosApi.upload(id, newFiles);
      const appended = (uploaded || []).map((p, i) => ({
        ...p,
        _key: p.id ?? `new-${Date.now()}-${i}`,
      }));
      setPhotos((cur) => [...cur, ...appended]);
      setNewFiles([]);
      setToast({ type: "success", message: "Fotos agregadas." });
    } catch (err) {
      setToast({ type: "error", message: err.message || "Error subiendo fotos." });
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await publicationsApi.update(id, form);
      if (newFiles.length > 0) {
        await photosApi.upload(id, newFiles);
      }
      navigate("/my-publications");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="page">
        <div className="home-loading">
          <span className="spinner" /> Cargando datos...
        </div>
      </div>
    );
  }

  return (
    <div className="page page--form">
      <div className="container publication-form-card publication-form-card--wide">
        <div className="publication-form-header">
          <div>
            <h2>Editar publicación</h2>
            <p className="auth-subtitle">
              Modifica los datos de tu mascota y gestiona sus fotos.
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

        <form onSubmit={handleSubmit} className="publication-form">
          <section className="publication-form__section">
            <h3 className="publication-form__title">Datos</h3>
            <div className="field-row">
              <div className="field-group">
                <label className="ui-label">Nombre</label>
                <input
                  name="petName"
                  value={form.petName}
                  onChange={handleChange}
                  required
                  className="ui-input"
                />
              </div>
              <div className="field-group">
                <label className="ui-label">Tipo</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="ui-input"
                >
                  <option value="DOG">🐶 Perro</option>
                  <option value="CAT">🐱 Gato</option>
                </select>
              </div>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="ui-label">Raza</label>
                <BreedAutocomplete
                  type={form.type}
                  value={form.breed}
                  onChange={handleChange}
                />
              </div>
              <div className="field-group">
                <label className="ui-label">Código postal</label>
                <input
                  name="zipCode"
                  value={form.zipCode}
                  onChange={handleChange}
                  inputMode="numeric"
                  required
                  className="ui-input"
                />
              </div>
            </div>
            <div className="field-group">
              <label className="ui-label">Descripción</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                minLength={10}
                required
                rows={4}
                className="ui-input publication-textarea"
              />
            </div>
          </section>

          <section className="publication-form__section">
            <h3 className="publication-form__title">Fotos actuales</h3>
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
                      loading="lazy"
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

            <h3 className="publication-form__title" style={{ marginTop: 24 }}>
              Agregar nuevas fotos
            </h3>
            <div
              className="photo-dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addNewFiles(e.dataTransfer.files || []);
              }}
            >
              <label className="photo-dropzone__label">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="photo-dropzone__input"
                  onChange={(e) => {
                    addNewFiles(e.target.files || []);
                    e.target.value = "";
                  }}
                />
                <span className="photo-dropzone__icon" aria-hidden>📷</span>
                <strong>Arrastra fotos o haz clic</strong>
                <span>Máximo {MAX_FILE_MB}MB por imagen — total {MAX_TOTAL} fotos</span>
              </label>
            </div>

            {newPreviews.length > 0 && (
              <>
                <div className="photo-manager__grid">
                  {newPreviews.map((src, idx) => (
                    <div key={src} className="photo-manager__item">
                      <img src={src} alt={`Nueva ${idx + 1}`} className="photo-manager__img" />
                      <button
                        type="button"
                        className="ui-btn ui-btn--ghost ui-btn--danger ui-btn--dense photo-manager__delete"
                        onClick={() => removeNewFile(idx)}
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
                <div className="stack-actions" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="ui-btn ui-btn--primary ui-btn--dense"
                    onClick={handleUploadNew}
                    disabled={uploading}
                  >
                    {uploading ? "Subiendo..." : `Subir ${newFiles.length} foto(s) ahora`}
                  </button>
                </div>
              </>
            )}
          </section>

          <div className="stack-actions">
            <button
              className="ui-btn ui-btn--primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
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
