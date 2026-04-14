"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  VehicleModelForm,
  VehicleModelFormData,
} from "../components/VehicleModelsForm/VehicleModelsForm";
import { apiClient } from "@/app/features/lib/api-client";

// Vehicle Brand အတွက် Interface
interface VehicleBrand {
  id: string;

  vehicle_brand_name?: string;
}

export default function AddVehicleModelPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await apiClient.get("master-vehicle/vehicle-brands");
        console.log("Raw API Response for Vehicle Brands:", response);

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

        setBrands(extractData<VehicleBrand>(response));
      } catch (error) {
        console.error("Error fetching vehicle brands:", error);
      }
    };
    fetchBrands();
  }, []);

  // ၂။ Data Save လုပ်မည့် Function
  const handleSubmit = async (data: VehicleModelFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        status: data.status || "Active",
      };

      await apiClient.post("master-vehicle/vehicle-models", payload);

      router.push("/vehicle-model");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unexpected error occurred while saving the model.");
      }
      console.error("Error creating vehicle model:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VehicleModelForm
      mode="create"
      onSubmit={handleSubmit}
      nameField="vehicle_model_name"
      nameLabel="Model Name"
      cancelHref="/vehicle-model"
      dropdown={{
        label: "Vehicle Brand",
        name: "vehicle_brand_id",
        options: brands.map((b) => ({
          id: b.id,
          name: b.vehicle_brand_name|| "Unknown Brand",
        })),
      }}
      loading={loading}
    />
  );
}
