"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompanyForm } from "../components/CompanyForm/CompanyForm";
import { apiClient } from "@/app/features/lib/api-client";
// import { toast } from "react-hot-toast"; // toast သုံးရင် ပိုကောင်းပါတယ်

export default function CreateCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      // Form Data ကို API သို့ တိုက်ရိုက်ပို့သည်
      await apiClient.post("/master-company/company", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      router.push("/company");
    } catch (error) {
      console.error("Error creating company:", error);
      // alert("Failed to create company.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CompanyForm mode="create" onSubmit={handleSubmit} loading={loading} />
  );
}
