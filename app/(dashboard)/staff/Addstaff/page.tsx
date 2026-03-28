"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StaffForm, StaffFormData } from "../components/StaffForm/StaffForm";
import { apiClient } from "@/app/features/lib/api-client";

export default function CreateStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: StaffFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "id") return;

        if (key === "photo" && value?.[0]) {
          formData.append("image", value[0]);
        } else if (key === "dob" && value) {
          formData.append(key, new Date(value as string).toISOString());
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value as string);
        }
      });

      await apiClient.post("/master-company/staff", formData);

      router.push("/staff");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unexpected error occurred while saving the staff record.");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return <StaffForm mode="create" onSubmit={handleSubmit} loading={loading} />;
}
