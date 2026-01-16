import { useEffect, useRef } from "react";
import L from "leaflet";
import { DefaultLeafletIcon } from "./fixLeafletIcon";

export default function LeafletMap({ lat, lng, title }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapDivRef.current) return;
    if (!lat || !lng) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapDivRef.current).setView([lat, lng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);

      markerRef.current = L.marker([lat, lng], {
        icon: DefaultLeafletIcon,
      }).addTo(mapRef.current);

      if (title) markerRef.current.bindPopup(title).openPopup();
    } else {
      mapRef.current.setView([lat, lng], 14);
      markerRef.current.setLatLng([lat, lng]);
      if (title) markerRef.current.bindPopup(title);
    }
  }, [lat, lng, title]);

  return (
    <div
      ref={mapDivRef}
      style={{
        height: "300px",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
}
