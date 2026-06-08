import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LocationMap = ({ lat, lng, label, zoom = 14, height = 280 }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || lat == null || lng == null) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      preferCanvas: true,
    }).setView([lat, lng], zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div class="map-pin map-pin--active"><span>📍</span></div>`,
      className: "map-pin-wrapper",
      iconSize: [42, 50],
      iconAnchor: [21, 46],
    });

    const marker = L.marker([lat, lng], { icon }).addTo(map);
    if (label) marker.bindPopup(label).openPopup();

    mapRef.current = map;
    const timer = setTimeout(() => map.invalidateSize(), 60);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, label, zoom]);

  if (lat == null || lng == null) {
    return (
      <div className="map-shell map-shell--unavailable" style={{ height }}>
        <p>No pudimos ubicar este código postal.</p>
      </div>
    );
  }

  return (
    <div className="map-shell" style={{ height }}>
      <div ref={containerRef} className="map-canvas" />
    </div>
  );
};

export default LocationMap;
