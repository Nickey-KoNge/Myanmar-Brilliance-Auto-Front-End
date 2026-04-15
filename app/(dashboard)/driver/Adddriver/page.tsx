"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DriverForm,
  DriverFormData,
} from "../components/DriverForm/DriverForm";
import { apiClient } from "@/app/features/lib/api-client";

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function AddDriverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSave = async (data: DriverFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "photo" && value?.[0]) {
          formData.append("image", value[0]);
        } else if (
          ["dob", "license_expiry", "join_date"].includes(key) &&
          value
        ) {
          formData.append(key, new Date(value as string).toISOString());
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value as string);
        }
      });

      await apiClient.post("master-company/driver", formData);
      router.push("/driver");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      const errorMsg =
        err?.response?.data?.message || "An error occurred while saving.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return <DriverForm mode="create" onSubmit={handleSave} loading={loading} />;
}
