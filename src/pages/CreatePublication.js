import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { photosApi, publicationsApi } from "../services/api";
import BreedAutocomplete from "../components/BreedAutocomplete";
import Toast from "../components/Toast";

const MAX_FILES = 8;
const MAX_FILE_MB = 5;

const initialForm = {
  petName: "",
  description: "",
  type: "DOG",
  breed: "",
  zipCode: "",
};

const CreatePublication = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addFiles = (incoming) => {
    const next = [];
    let rejected = 0;
    Array.from(incoming).forEach((f) => {
      if (!f.type.startsWith("image/")) {
        rejected += 1;
        return;
      }
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        rejected += 1;
        return;
      }
      next.push(f);
    });
    if (rejected) {
      setToast({
        type: "warning",
        message: `${rejected} archivo(s) ignorados. Solo imágenes hasta ${MAX_FILE_MB}MB.`,
      });
    }
    setFiles((cur) => [...cur, ...next].slice(0, MAX_FILES));
  };

  const handleFileInput = (event) => {
    addFiles(event.target.files || []);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files || []);
  };

  const removeFile = (idx) => {
    setFiles((cur) => cur.filter((_, i) => i !== idx));
  };

  const valid = useMemo(() => {
    return (
      form.petName.trim().length > 0 &&
      form.description.trim().length >= 10 &&
      form.zipCode.trim().length > 0 &&
      files.length > 0
    );
  }, [form, files]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) {
      setError("Completa los campos requeridos y agrega al menos una foto.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const created = await publicationsApi.create({
        ...form,
        breed: form.breed || null,
      });
      await photosApi.upload(created.id, files);
      navigate(`/publications/${created.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page--form">
      <div className="container publication-form-card publication-form-card--wide">
        <div className="publication-form-header">
          <div>
            <h2>Nueva publicación</h2>
            <p className="auth-subtitle">
              Completa los datos de tu mascota y sube fotos en un solo paso.
            </p>
          </div>
          <button
            className="ui-btn ui-btn--ghost"
            type="button"
            onClick={() => navigate("/home")}
          >
            Volver
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="publication-form">
          <section className="publication-form__section">
            <h3 className="publication-form__title">Datos de la mascota</h3>
            <div className="field-row">
              <div className="field-group">
                <label className="ui-label" htmlFor="petName">
                  Nombre de la mascota
                </label>
                <input
                  id="petName"
                  name="petName"
                  value={form.petName}
                  onChange={handleChange}
                  required
                  className="ui-input"
                  placeholder="Ej. Luna"
                />
              </div>
              <div className="field-group">
                <label className="ui-label" htmlFor="type">
                  Tipo
                </label>
                <select
                  id="type"
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
                <label className="ui-label" htmlFor="zipCode">
                  Código postal
                </label>
                <input
                  id="zipCode"
                  name="zipCode"
                  value={form.zipCode}
                  onChange={handleChange}
                  inputMode="numeric"
                  required
                  className="ui-input"
                  placeholder="Ej. 03100"
                />
              </div>
            </div>
            <div className="field-group">
              <label className="ui-label" htmlFor="description">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                minLength={10}
                required
                className="ui-input publication-textarea"
                placeholder="Cuenta su historia, carácter, lo que necesita..."
                rows={4}
              />
              <span className="ui-hint">
                {form.description.length}/10 mínimos
              </span>
            </div>
          </section>

          <section className="publication-form__section">
            <h3 className="publication-form__title">Fotos</h3>
            <p className="ui-hint">
              Agrega hasta {MAX_FILES} imágenes. Sirve para activar la publicación.
            </p>
            <div
              className="photo-dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <label className="photo-dropzone__label">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="photo-dropzone__input"
                  onChange={handleFileInput}
                />
                <span className="photo-dropzone__icon" aria-hidden>📷</span>
                <strong>Arrastra fotos o haz clic</strong>
                <span>Máximo {MAX_FILE_MB}MB por imagen</span>
              </label>
            </div>

            {previews.length > 0 && (
              <div className="photo-manager__grid">
                {previews.map((src, idx) => (
                  <div key={src} className="photo-manager__item">
                    <img src={src} alt={`Foto ${idx + 1}`} className="photo-manager__img" />
                    <button
                      type="button"
                      className="ui-btn ui-btn--ghost ui-btn--danger ui-btn--dense photo-manager__delete"
                      onClick={() => removeFile(idx)}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="publication-form__section publication-form__review">
            <h3 className="publication-form__title">Resumen</h3>
            <ul className="publication-form__review-list">
              <li>
                <strong>Nombre:</strong> {form.petName || <em>pendiente</em>}
              </li>
              <li>
                <strong>Tipo:</strong> {form.type === "DOG" ? "Perro" : "Gato"}
              </li>
              <li>
                <strong>Raza:</strong> {form.breed || "Mestizo"}
              </li>
              <li>
                <strong>C.P.:</strong> {form.zipCode || <em>pendiente</em>}
              </li>
              <li>
                <strong>Fotos:</strong> {files.length}
              </li>
            </ul>
          </section>

          <div className="stack-actions">
            <button
              className="ui-btn ui-btn--primary"
              type="submit"
              disabled={loading || !valid}
            >
              {loading ? "Publicando..." : "Publicar"}
            </button>
            <button
              className="ui-btn ui-btn--ghost"
              type="button"
              onClick={() => navigate("/home")}
              disabled={loading}
            >
              Cancelar
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

export default CreatePublication;
