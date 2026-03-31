"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  VehicleBrandsForm,
  VehicleBrandsFormData,
} from "../components/VehicleBrandsForm/VehicleBrandsForm";
import { apiClient } from "@/app/features/lib/api-client";

export default function CreateVehicleBrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: VehicleBrandsFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "photo" && value?.[0]) {
          formData.append("image", value[0]);
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value as string);
        }
      });

      await apiClient.post("/master-vehicle/vehicle-brands", formData);

      router.push("/vehicle-brands");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Error creating vehicle brand.");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <VehicleBrandsForm
      mode="create"
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}
