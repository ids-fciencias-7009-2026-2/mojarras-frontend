import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicationService } from "../services/PublicationService";
import BreedAutocomplete from "../components/BreedAutocomplete";

const CreatePublication = () => {
  const [form, setForm] = useState({
    petName: "",
    description: "",
    type: "DOG",
    breed: "",
    zipCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      const created = await publicationService.createPublication(token, form);
      navigate(`/publications/${created.id}/complete`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page--form">
      <div className="container auth-card publication-form-card">
        <div className="publication-form-header">
          <div>
            <h2>Nueva Publicacion</h2>
            <p className="auth-subtitle">
              Completa los datos base. Luego podras subir fotos e iniciar el
              flujo de interes.
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

        <form onSubmit={handleSubmit} className="stack-form">
          <input
            name="petName"
            placeholder="Nombre del animal"
            value={form.petName}
            onChange={handleChange}
            required
            className="ui-input"
          />
          <textarea
            name="description"
            placeholder="Descripción"
            value={form.description}
            onChange={handleChange}
            minLength={10}
            required
            className="ui-input publication-textarea"
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="ui-input"
          >
            <option value="DOG">Perro</option>
            <option value="CAT">Gato</option>
          </select>
          <BreedAutocomplete
            type={form.type}
            value={form.breed}
            onChange={handleChange}
          />
          <input
            name="zipCode"
            placeholder="Código postal"
            value={form.zipCode}
            onChange={handleChange}
            required
            className="ui-input"
          />

          <div className="stack-actions">
            <button
              className="ui-btn ui-btn--primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePublication;
