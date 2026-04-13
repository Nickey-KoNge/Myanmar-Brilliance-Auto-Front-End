"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/features/lib/api-client";
import { VehicleForm, VehicleFormData } from "../components/VehicleForm";

interface Station {
  id: string;
  station_name: string;
}

interface Group {
  id: string;
  group_name: string;
}

interface VehicleModel {
  id: string;
  vehicle_model_name: string;
}

export default function CreateVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [stations, setStations] = useState<Station[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsRes, groupsRes, vehicleModelsRes] = await Promise.all([
          apiClient.get("/master-company/stations"),
          apiClient.get("/master-company/groups"),
          apiClient.get("/master-vehicle/vehicle-models"),
        ]);

        const stRes = stationsRes as unknown as { data?: Station[] };
        const gpRes = groupsRes as unknown as {
          data?: Group[];
          items?: Group[];
        };
        const vmRes = vehicleModelsRes as unknown as {
          data?: VehicleModel[];
          items?: VehicleModel[];
        };

        setStations(stRes.data || []);
        setGroups(gpRes.data || gpRes.items || []);
        setVehicleModels(vmRes.data || vmRes.items || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (data: VehicleFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "id") return; // Create လုပ်ချိန်တွင် id မလိုပါ

        if (key === "image" && value) {
          const isFileList =
            typeof window !== "undefined" && value instanceof FileList;
          if (isFileList && (value as FileList).length > 0) {
            formData.append("image", (value as FileList)[0]);
          }
        } else if (
          (key === "vehicle_license_exp" || key === "purchase_date") &&
          value
        ) {
          formData.append(key, new Date(value as string).toISOString());
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });

      await apiClient.post("/master-vehicle/vehicles", formData);

      router.push("/vehicle");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unexpected error occurred while saving the vehicle record.");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <VehicleForm
      mode="create"
      onSubmit={handleSubmit}
      initialData={{}}
      loading={loading}
      stations={stations}
      groups={groups}
      vehicleModels={vehicleModels}
    />
  );
}
