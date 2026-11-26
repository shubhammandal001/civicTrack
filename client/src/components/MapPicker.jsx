import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Vite me Leaflet ke default marker ki image toot jaati hai, ye uska fix hai
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [30.3165, 78.0322]; // Dehradun

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyToLocation({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), 15));
    }
  }, [location, map]);
  return null;
}

export default function MapPicker({ location, onPick }) {
  return (
    <MapContainer
      center={location ? [location.lat, location.lng] : DEFAULT_CENTER}
      zoom={13}
      className="h-64 w-full rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      <FlyToLocation location={location} />
      {location && <Marker position={[location.lat, location.lng]} />}
    </MapContainer>
  );
}