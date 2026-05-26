import React, { useEffect, useId, useState } from "react";
import { publicationService } from "../services/PublicationService";

const BreedAutocomplete = ({
  type,
  value,
  onChange,
  name = "breed",
  className = "ui-input",
}) => {
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const listId = useId();

  useEffect(() => {
    if (!type) return;

    let cancelled = false;
    const loadBreeds = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const data = await publicationService.getBreeds(token, type);
        if (!cancelled) setBreeds(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setBreeds([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBreeds();
    return () => {
      cancelled = true;
    };
  }, [type]);

  return (
    <>
      <input
        name={name}
        value={value}
        onChange={onChange}
        list={listId}
        className={className}
        placeholder={loading ? "Cargando razas..." : "Escribe o elige una raza"}
        autoComplete="off"
      />
      <datalist id={listId}>
        {breeds.map((breed) => (
          <option key={breed} value={breed} />
        ))}
      </datalist>
    </>
  );
};

export default BreedAutocomplete;
