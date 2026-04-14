"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  VehicleModelForm,
  VehicleModelFormData,
} from "../../components/VehicleModelsForm/VehicleModelsForm";
import { apiClient } from "@/app/features/lib/api-client";

interface VehicleBrand {
  id: string;
  vehicle_brand_name?: string;
  name?: string;
  brand_name?: string;
}

interface VehicleModelApiResponse {
  id: string;
  vehicle_model_name?: string;
  vehicle_brand_id?: string;
  body_type?: string;
  fuel_type?: string;
  transmission?: string;
  engine_capacity?: string;
  year_of_release?: string;
  status?: string;
}

export default function EditVehicleModelPage() {
  const router = useRouter();
  const { id } = useParams();

  const [initialData, setInitialData] =
    useState<Partial<VehicleModelFormData> | null>(null);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [modelRes, brandsRes] = await Promise.all([
          apiClient.get(`master-vehicle/vehicle-models/${id}`),
          apiClient.get("master-vehicle/vehicle-brands?limit=1000"),
        ]);

        const safeModelRes = modelRes as unknown as
          | { data?: VehicleModelApiResponse }
          | VehicleModelApiResponse;

        const m =
          "data" in safeModelRes && safeModelRes.data
            ? safeModelRes.data
            : (safeModelRes as VehicleModelApiResponse);

        if (m && m.id) {
          setInitialData({
            vehicle_model_name: m.vehicle_model_name || "",
            vehicle_brand_id: m.vehicle_brand_id || "",
            body_type: m.body_type || "",
            fuel_type: m.fuel_type || "",
            transmission: m.transmission || "",
            engine_capacity: m.engine_capacity || "",
            year_of_release: m.year_of_release
              ? m.year_of_release.split("T")[0]
              : "",
            status: m.status || "Active",
          });
        }

        // --- 2. Handling Brands Data safely ---
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

        setBrands(extractData<VehicleBrand>(brandsRes));
      } catch (error) {
        console.error("Error fetching vehicle model data:", error);
        alert("Failed to load vehicle model data");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpdate = async (data: VehicleModelFormData) => {
    setLoading(true);
    try {
      const payload: Partial<VehicleModelFormData> = { ...data };
      delete payload.id;

      // Backend သို့ ပို့ရန် ISO String ပြောင်းခြင်း
      if (payload.year_of_release) {
        payload.year_of_release = new Date(
          payload.year_of_release,
        ).toISOString();
      }

      await apiClient.patch(`master-vehicle/vehicle-models/${id}`, payload);

      router.push("/vehicle-model");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Update Failed. Please try again.");
      }
      console.error("Error updating vehicle model:", error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: "2rem" }}>Loading record...</div>;
  if (!initialData)
    return <div style={{ padding: "2rem" }}>Error loading data.</div>;

  return (
    <VehicleModelForm
      mode="update"
      initialData={initialData}
      onSubmit={handleUpdate}
      nameField="vehicle_model_name"
      nameLabel="Model Name"
      cancelHref="/vehicle-model"
      dropdown={{
        label: "Vehicle Brand",
        name: "vehicle_brand_id",
        options: brands.map((b) => ({
          id: b.id,
          name:
            b.vehicle_brand_name || b.name || b.brand_name || "Unknown Brand",
        })),
      }}
      loading={loading}
    />
  );
}
