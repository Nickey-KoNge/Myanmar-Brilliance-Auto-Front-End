'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from "leaflet";

function LocationMarker({ setValue }: any) {
  const [position, setPosition] = useState<any>(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      const pos = { lat, lng };

      setPosition(pos);
      setValue("gps_location", `${lat.toFixed(4)},${lng.toFixed(4)}`);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ setValue }: any) {


  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={[16.8661, 96.1951]}
      zoom={13}
      style={{ height: "100%", width: "100%" ,borderRadius:"0.5rem"}}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker setValue={setValue} />
    </MapContainer>
  );
}