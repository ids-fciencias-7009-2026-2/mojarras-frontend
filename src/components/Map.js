import React, { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MEXICO_CENTER = [23.6345, -102.5528];
const MEXICO_ZOOM = 5;
const FOCUS_ZOOM = 15;

function petEmoji(type) {
  return type === "DOG" ? "🐶" : "🐱";
}

function buildClusterIcon(count, highlight) {
  const size = Math.min(64, 36 + Math.log2(count + 1) * 8);
  return L.divIcon({
    html: `<div class="map-cluster${highlight ? " map-cluster--active" : ""}" style="width:${size}px;height:${size}px;line-height:${size}px;">${count}</div>`,
    className: "map-cluster-wrapper",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function buildSingleIcon(item, highlight) {
  return L.divIcon({
    html: `<div class="map-pin${highlight ? " map-pin--active" : ""}"><span>${petEmoji(item.type)}</span></div>`,
    className: "map-pin-wrapper",
    iconSize: [42, 50],
    iconAnchor: [21, 46],
  });
}

const Map = ({
  clusters = [],
  selectedId = null,
  onSelectPublication,
  onSelectCluster,
  center,
  zoom,
  height = "100%",
  className = "",
  fitOnUpdate = true,
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const lastClustersRef = useRef(null);

  const safeClusters = useMemo(
    () => clusters.filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng)),
    [clusters],
  );

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      preferCanvas: true,
      worldCopyJump: true,
    }).setView(center || MEXICO_CENTER, zoom || MEXICO_ZOOM);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(handleResize, 60);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    if (safeClusters.length === 0) return;

    const bounds = L.latLngBounds([]);
    safeClusters.forEach((cluster) => {
      const items = cluster.publications || [];
      const isSelectedCluster =
        selectedId && items.some((p) => p.id === selectedId);
      const isSingle = items.length === 1;
      const icon = isSingle
        ? buildSingleIcon(items[0], isSelectedCluster)
        : buildClusterIcon(cluster.count, isSelectedCluster);

      const marker = L.marker([cluster.lat, cluster.lng], {
        icon,
        riseOnHover: true,
        keyboard: true,
        title: isSingle ? items[0].petName : `${cluster.count} mascotas`,
      });

      marker.on("click", () => {
        const target = L.latLng(cluster.lat, cluster.lng);
        const targetZoom = Math.max(map.getZoom(), FOCUS_ZOOM);
        map.flyTo(target, targetZoom, { duration: 0.6 });

        if (isSingle && onSelectPublication) {
          onSelectPublication(items[0], cluster);
        } else if (onSelectCluster) {
          onSelectCluster(cluster);
        }
      });

      marker.addTo(layer);
      bounds.extend([cluster.lat, cluster.lng]);
    });

    const clustersChanged = lastClustersRef.current !== safeClusters;
    lastClustersRef.current = safeClusters;

    if (fitOnUpdate && clustersChanged && bounds.isValid()) {
      map.flyToBounds(bounds.pad(0.25), { maxZoom: 13, duration: 0.6 });
    }
  }, [safeClusters, selectedId, onSelectPublication, onSelectCluster, fitOnUpdate]);

  return (
    <div className={`map-shell ${className}`} style={{ height }}>
      <div ref={containerRef} className="map-canvas" />
    </div>
  );
};

export default Map;
