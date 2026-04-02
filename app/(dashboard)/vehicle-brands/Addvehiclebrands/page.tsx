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

      const response = await apiClient.post(
        "/master-vehicle/vehicle-brands",
        formData,
      );
      router.push("/vehicle-brands");
    } catch (error: any) {
      if (error.response && error.response.data) {
        console.error("VALIDATION ERRORS:", error.response.data.message);
        alert("Backend Error: " + JSON.stringify(error.response.data.message));
      } else {
        console.error("Unexpected Error:", error);
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
