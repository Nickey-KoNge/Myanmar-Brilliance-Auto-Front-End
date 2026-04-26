"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/features/lib/api-client";
import { VehicleForm, VehicleFormData } from "../components/VehicleForm";

export default function CreateVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: VehicleFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "id") return;

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
  
      loading={loading}
    />
  );
}
