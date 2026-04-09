"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  VehicleModelForm,
  VehicleModelFormData,
} from "../components/VehicleModelsForm/VehicleModelsForm"; // သင်ဖန်တီးထားမည့် Form Component
import { apiClient } from "@/app/features/lib/api-client";

export default function AddVehicleModelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSave = async (data: VehicleModelFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        status: data.status || "Active",
      };

      await apiClient.post("/vehicle-model/register", payload);

      router.push("/vehicle-model");
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        "An error occurred while saving the model.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VehicleModelForm mode="create" onSubmit={handleSave} loading={loading} />
  );
}
