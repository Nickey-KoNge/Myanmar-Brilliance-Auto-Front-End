"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  VehicleModelForm,
  VehicleModelFormData,
} from "../../components/VehicleModelsForm/VehicleModelsForm";
import { apiClient } from "@/app/features/lib/api-client";

export default function EditVehicleModelPage() {
  const router = useRouter();
  const { id } = useParams();
  const [initialData, setInitialData] =
    useState<Partial<VehicleModelFormData> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVehicleModel = async () => {
      try {
        const response = await apiClient.get(`/vehicle-model/${id}`);
        const res = response?.data || response;
        setInitialData(res);
      } catch (error) {
        console.error("Error fetching vehicle model:", error);
        alert("Failed to load vehicle model data");
      }
    };
    if (id) fetchVehicleModel();
  }, [id]);

  const handleUpdate = async (data: any) => {
    setLoading(true);
    try {
      const {
        id: _,
        vehicle_brand_name,
        createdAt,
        updatedAt,
        brands,
        ...cleanData
      } = data;

      const payload = {
        ...cleanData,
        year_of_release: cleanData.year_of_release
          ? new Date(cleanData.year_of_release).toISOString()
          : null,
      };

      await apiClient.patch(`/vehicle-model/${id}`, payload);

      alert("Vehicle Model Updated Successfully!");
      router.push("/vehicle-model");
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Update Failed. Please try again.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!initialData)
    return <p className="p-6 text-white text-center">Loading Data...</p>;

  return (
    <VehicleModelForm
      mode="update"
      initialData={initialData}
      onSubmit={handleUpdate}
      loading={loading}
    />
  );
}
