"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CompanyForm,
  CompanyFormData,
} from "../../components/CompanyForm/CompanyForm";
import { apiClient } from "@/app/features/lib/api-client";

export default function UpdateCompanyPage() {
  const params = useParams();
  const companyId = params.id;
  const router = useRouter();

  const [companyData, setCompanyData] = useState<CompanyFormData | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await apiClient.get(
          `/master-company/company/${companyId}`,
        );
        const data = response.data || response;

        if (data) {
          // API မှလာသော key များကို Form ၏ interface နှင့် ကိုက်ညီအောင် ပြောင်းလဲပေးခြင်း
          setCompanyData({
            company_name: data.company_name || "",
            reg_number: data.reg_number || "",
            phone: data.phone || "",
            email: data.email || "",
            country: data.country || "",
            city: data.city || "",
            street_address: data.street_address || "",
            website_url: data.website_url || "",
            establish_year: data.establish_year || "",
            reg_exp_date: data.reg_exp_date
              ? data.reg_exp_date.split("T")[0]
              : "",
            image: data.image || "", // image URL string
            owner_name: data.owner_name || "",
            owner_phone: data.owner_phone || "",
            owner_email: data.owner_email || "",
          });
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      } finally {
        setFetching(false);
      }
    };

    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId]);

  const handleUpdate = async (formData: FormData) => {
    setLoading(true);
    try {
      // Patch သို့မဟုတ် Put ကို သုံးနိုင်သည် (API ပေါ်မူတည်၍)
      await apiClient.patch(`/master-company/company/${companyId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      router.push("/company");
    } catch (error) {
      console.error("Error updating company:", error);
      alert("Failed to update company.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ padding: "2rem" }}>Loading company data...</div>;
  }

  return (
    <CompanyForm
      mode="update"
      initialData={companyData}
      onSubmit={handleUpdate}
      loading={loading}
    />
  );
}
