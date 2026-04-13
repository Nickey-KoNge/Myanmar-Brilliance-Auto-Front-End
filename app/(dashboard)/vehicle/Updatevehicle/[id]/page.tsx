"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/app/features/lib/api-client";
import { VehicleForm, VehicleFormData } from "../../components/VehicleForm";

// API မှ ပြန်လာမည့် Vehicle Data ပုံစံကို အတိအကျ သတ်မှတ်ခြင်း (any မသုံးရန်)
interface VehicleApiResponse {
  id: string;
  vehicle_name?: string;
  city_taxi_no?: string;
  serial_no?: string;
  vin_no?: string;
  engine_no?: string;
  license_plate?: string;
  color?: string;
  license_type?: string;
  current_odometer?: string;
  vehicle_license_exp?: string;
  service_intervals?: string;
  purchase_date?: string;
  image?: string;
  station_id?: string;
  group_id?: string;
  vehicle_model_id?: string;
  supplier_id?: string;
  station?: { id: string; station_name: string };
  group?: { id: string; group_name: string };
  vehicle_model?: { id: string; vehicle_model_name: string };
}

interface StationOption {
  id: string;
  station_name: string;
}

interface GroupOption {
  id: string;
  group_name: string;
}

interface VehicleModelOption {
  id: string;
  vehicle_model_name: string;
}

export default function UpdateVehiclePage() {
  const { id } = useParams();
  const router = useRouter();

  const [initialData, setInitialData] =
    useState<Partial<VehicleFormData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [stations, setStations] = useState<StationOption[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModelOption[]>([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [stationsRes, groupsRes, vehicleModelsRes] = await Promise.all([
          apiClient.get("/master-company/stations"),
          apiClient.get("/master-company/groups"),
          apiClient.get("/master-vehicle/vehicle-models"),
        ]);

        const extractData = <T,>(res: unknown): T[] => {
          if (!res) return [];
          if (Array.isArray(res)) return res as T[];

          const resObj = res as Record<string, unknown>;
          if (Array.isArray(resObj.data)) return resObj.data as T[];
          if (Array.isArray(resObj.items)) return resObj.items as T[];

          if (resObj.data && typeof resObj.data === "object") {
            const nested = resObj.data as Record<string, unknown>;
            if (Array.isArray(nested.data)) return nested.data as T[];
          }
          return [];
        };

        setStations(extractData<StationOption>(stationsRes));
        setGroups(extractData<GroupOption>(groupsRes));
        setVehicleModels(extractData<VehicleModelOption>(vehicleModelsRes));
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const res = await apiClient.get(`/master-vehicle/vehicles/${id}`);
        const v = res as unknown as VehicleApiResponse;

        if (v && v.id) {
          setInitialData({
            vehicle_name: v.vehicle_name || "",
            station_id: v.station_id ?? v.station?.id ?? "",
            group_id: v.group_id ?? v.group?.id ?? "",
            vehicle_model_id: v.vehicle_model_id ?? v.vehicle_model?.id ?? "",
            supplier_id: v.supplier_id || "",
            city_taxi_no: v.city_taxi_no || "",
            serial_no: v.serial_no || "",
            vin_no: v.vin_no || "",
            engine_no: v.engine_no || "",
            license_plate: v.license_plate || "",
            color: v.color || "",
            license_type: v.license_type || "",
            current_odometer: v.current_odometer || "",

            vehicle_license_exp: v.vehicle_license_exp
              ? v.vehicle_license_exp.split("T")[0]
              : "",
            service_intervals: v.service_intervals
              ? v.service_intervals.split("T")[0]
              : "",
            purchase_date: v.purchase_date ? v.purchase_date.split("T")[0] : "",
            image: v.image || "",
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchVehicleData();
  }, [id]);

  const handleSubmit = async (data: VehicleFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "id" || (key === "image" && typeof value === "string"))
          return;

        if (key === "image") {
          const isFileList =
            typeof window !== "undefined" && value instanceof FileList;
          if (isFileList && (value as FileList).length > 0) {
            formData.append("image", (value as FileList)[0] as Blob);
          }
        } else if (
          (key === "vehicle_license_exp" ||
            key === "purchase_date" ||
            key === "service_intervals") &&
          value
        ) {
          formData.append(key, new Date(value as string).toISOString());
        } else if (value !== "" && value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      await apiClient.patch(`/master-vehicle/vehicles/${id}`, formData);

      router.push("/vehicle");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "An unexpected error occurred while updating the vehicle record.",
        );
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: "2rem" }}>Loading record...</div>;
  if (!initialData)
    return <div style={{ padding: "2rem" }}>Error loading data.</div>;

  return (
    <VehicleForm
      mode="update"
      initialData={initialData}
      onSubmit={handleSubmit}
      loading={loading}
      stations={stations}
      groups={groups}
      vehicleModels={vehicleModels}
    />
  );
}
