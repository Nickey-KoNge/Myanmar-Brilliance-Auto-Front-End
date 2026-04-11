"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  DriverForm,
  DriverFormData,
} from "../../components/DriverForm/DriverForm";
import { apiClient } from "@/app/features/lib/api-client";

export default function EditDriverPage() {
  const router = useRouter();
  const { id } = useParams();
  const [initialData, setInitialData] =
    useState<Partial<DriverFormData> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const response = await apiClient.get(`/driver/${id}`);
        const res = response?.data || response;
        setInitialData(res);
      } catch (error) {
        console.error("Error fetching driver:", error);
        alert("Failed to load driver data");
      }
    };
    if (id) fetchDriver();
  }, [id]);

  const handleUpdate = async (data: DriverFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      const excludedFields = ["id", "createdAt", "updatedAt", "photo", "image"];

      Object.entries(data).forEach(([key, value]) => {
        if (key === "photo" && value?.[0]) {
          formData.append("image", value[0]);
        } else if (
          !excludedFields.includes(key) &&
          value !== undefined &&
          value !== null
        ) {
          // Date handling
          if (
            ["dob", "license_expiry", "join_date"].includes(key) &&
            value !== ""
          ) {
            formData.append(key, new Date(value as string).toISOString());
          } else {
            formData.append(key, String(value));
          }
        }
      });

      await apiClient.patch(`/driver/${id}`, formData);

      alert("Updated Successfully!");
      router.push("/driver");
    } catch (error: any) {
      alert(error?.response?.data?.message || "Update Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) return <p>Loading...</p>;

  return (
    <DriverForm
      mode="update"
      initialData={initialData}
      onSubmit={handleUpdate}
      loading={loading}
    />
  );
}
