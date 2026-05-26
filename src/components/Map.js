import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const Map = ({ zipCode, petName }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!zipCode) {
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false;

    const destroyMap = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };

    const initMap = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=mx&format=json&limit=1`,
          { headers: { "User-Agent": "Mojarras-PetAdoption" } },
        );

        if (!response.ok) throw new Error("geocoding-failed");

        const data = await response.json();
        if (!data || data.length === 0) throw new Error("no-location");

        if (cancelled) return;

        if (!mapRef.current) throw new Error("no-container");

        const { lat, lon } = data[0];

        destroyMap();

        mapInstanceRef.current = L.map(mapRef.current).setView(
          [parseFloat(lat), parseFloat(lon)],
          13,
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);

        L.marker([parseFloat(lat), parseFloat(lon)])
          .bindPopup(
            `<strong>${petName}</strong><br/>Código postal: ${zipCode}`,
          )
          .addTo(mapInstanceRef.current)
          .openPopup();

        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    initMap();

    return () => {
      cancelled = true;
      destroyMap();
    };
  }, [zipCode, petName]);

  return (
    <div className="map-wrapper">
      {/* aaaaaaaaaa */}
      <div ref={mapRef} className="map-container" />

      {loading && (
        <div className="map-container map-container--overlay map-container--loading">
          <span className="spinner" /> Cargando ubicación...
        </div>
      )}

      {error && !loading && (
        <div className="map-container map-container--overlay map-container--error">
          <p>No pudimos cargar el mapa.</p>
        </div>
      )}
    </div>
  );
};

export default Map;
