// 'use client';

// import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
// import { useEffect, useState } from 'react';
// import 'leaflet/dist/leaflet.css';
// import L from "leaflet";

// function LocationMarker({ setValue }: any) {
//   const [position, setPosition] = useState<any>(null);

//   useMapEvents({
//     click(e) {
//       const { lat, lng } = e.latlng;

//       const pos = { lat, lng };

//       setPosition(pos);
//       setValue("gps_location", `${lat.toFixed(4)},${lng.toFixed(4)}`);
//     },
//   });

//   return position ? <Marker position={position} /> : null;
// }

// export default function MapPicker({ setValue }: any) {

//   useEffect(() => {
//     delete (L.Icon.Default.prototype as any)._getIconUrl;

//     L.Icon.Default.mergeOptions({
//       iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//       iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//       shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
//     });
//   }, []);

//   return (
//     <MapContainer
//       center={[16.8661, 96.1951]}
//       zoom={13}
//       style={{ height: "100%", width: "100%" ,borderRadius:"0.5rem"}}
//     >
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//       <LocationMarker setValue={setValue} />
//     </MapContainer>
//   );
// }

"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 🛑 1. Type Error ကို ရှင်းရန် "gps_location" လို့ အတိအကျ သတ်မှတ်ပေးပါမယ်
interface MapPickerProps {
  setValue: (name: "gps_location", value: string) => void;
}

function LocationMarker({ setValue }: MapPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const pos = { lat, lng };

      setPosition(pos);
      // React Hook Form ထဲကို Data ထည့်ပေးခြင်း
      setValue("gps_location", `${lat.toFixed(4)},${lng.toFixed(4)}`);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ setValue }: MapPickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 🛑 2. ESLint Warning ကို ယာယီကျော်ရန် comment ထည့်ပေးပါတယ်
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          background: "#e5e5e5",
          borderRadius: "0.5rem",
        }}
      />
    );
  }

  return (
    <MapContainer
      center={[16.8661, 96.1951]}
      zoom={13}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker setValue={setValue} />
    </MapContainer>
  );
}
