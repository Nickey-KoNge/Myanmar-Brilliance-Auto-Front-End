"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  VehicleBrandsForm,
  VehicleBrandsFormData,
} from "../../components/VehicleBrandsForm/VehicleBrandsForm";
import { apiClient } from "@/app/features/lib/api-client";

interface VehicleBrandApiResponse {
  id: string;
  vehicle_brand_name?: string;
  country_of_origin?: string;
  manufacturer?: string;
  description?: string;
  image?: string;
}

export default function EditVehicleBrandPage() {
  const { id } = useParams();
  const router = useRouter();

  const [initialData, setInitialData] =
    useState<Partial<VehicleBrandsFormData> | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // ✅ Fetch Vehicle Brand Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get(`/master-vehicle/vehicle-brands/${id}`);

        const data = res as unknown as VehicleBrandApiResponse;

        if (data && data.id) {
          setInitialData({
            vehicle_brand_name: data.vehicle_brand_name ?? "",
            country_of_origin: data.country_of_origin ?? "",
            manufacturer: data.manufacturer ?? "",
            description: data.description ?? "",
            image: data.image ?? "",
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleSubmit = async (data: VehicleBrandsFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "image") return;

        if (key === "photo") {
          if (value?.[0]) {
            formData.append("image", value[0]);
          }
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value as string);
        }
      });

      await apiClient.patch(`/master-vehicle/vehicle-brands/${id}`, formData);

      router.push("/vehicle-brands");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Error updating vehicle brand.");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div>Loading record...</div>;
  if (!initialData) return <div>Data not found.</div>;

  return (
    <VehicleBrandsForm
      mode="update"
      initialData={initialData}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}
