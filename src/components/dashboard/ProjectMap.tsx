import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ProjectLocation } from "@/hooks/useProjects";

// Fix default marker icon
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface ProjectMapProps {
  locations: ProjectLocation[];
  projectNames?: Record<string, string>;
  className?: string;
}

const ProjectMap = ({ locations, projectNames, className }: ProjectMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    const center: L.LatLngExpression = locations.length > 0
      ? [locations[0].latitude, locations[0].longitude]
      : [20.0, 41.5]; // Al Baha default

    const map = L.map(mapRef.current).setView(center, 10);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    locations.forEach((loc) => {
      const projectName = projectNames?.[loc.project_id] || "";
      L.marker([loc.latitude, loc.longitude])
        .addTo(map)
        .bindPopup(
          `<div style="font-family: 'IBM Plex Sans Arabic', sans-serif; text-align: right;">
            <strong>${loc.name}</strong>
            ${projectName ? `<br/><span style="color: #666;">${projectName}</span>` : ""}
            ${loc.description ? `<br/><small>${loc.description}</small>` : ""}
          </div>`
        );
    });

    if (locations.length > 1) {
      const bounds = L.latLngBounds(
        locations.map((l) => [l.latitude, l.longitude] as L.LatLngTuple)
      );
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [locations, projectNames]);

  return (
    <div
      ref={mapRef}
      className={`rounded-xl overflow-hidden border border-border ${className || "h-[350px]"}`}
    />
  );
};

export default ProjectMap;
