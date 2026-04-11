"use client";
import { useEffect, useState } from "react";
import { BranchForm } from "../../components/BranchForm/BranchForm";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/app/features/lib/api-client";
import { FieldValues } from "react-hook-form";

interface BranchFormData {
  [key: string]: string | undefined;
  branches_name: string;
  gps_location: string;
  phone: string;
  division: string;
  city: string;
  address: string;
  description: string;
  company_id: string;
  company_name: string;
  id: string;
  company?: string;
  staff?: string;
  stations?: string;
}

interface Company {
  id: string;
  company_name: string;
}

export default function UpdateBranch() {
  const params = useParams();
  const branchId = params.id;
  const router = useRouter();

  const [branchData, setBranchData] = useState<BranchFormData | undefined>(
    undefined,
  );

  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await apiClient.get(
          `/master-company/branches/${branchId}`,
        );

        // TypeScript error 2352 ကို ရှောင်ရန် unknown သို့ အရင် cast လုပ်ပါ
        const rawData = (response as { data?: unknown }).data || response;
        const typedData = rawData as BranchFormData;

        if (typedData) {
          setBranchData({
            ...typedData,
            company_id: typedData.company_id || "",
          });
        }
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    if (branchId) {
      fetchBranchData();
    }
  }, [branchId]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await apiClient.get("/master-company/company");

        // 🛑 Error 2352 Fix: unknown အရင်ခံပြီးမှ Company[] ဖြစ်ကြောင်း cast လုပ်ပါ
        const raw = (res as { data?: unknown }).data || res;
        const companyArray = raw as Company[];

        setCompanies(Array.isArray(companyArray) ? companyArray : []);
        console.log("Fetched companies:", companyArray); 
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  console.log("Branch Data:", branchData);

  const handleUpdate = async (data: FieldValues) => {
    try {
      // 🛑 ESLint Unused-vars Fix:
      // Variable ထုတ်ယူမယ့်အစား မလိုတဲ့ property တွေကို delete လုပ်တာက ပိုသန့်ရှင်းပါတယ်
      const payload = { ...data };
      delete payload.id;
      delete payload.company;
      delete payload.company_name;
      delete payload.staff;
      delete payload.stations;

      if (!payload.company_id) {
        delete payload.company_id;
      }

      await apiClient.patch(`/master-company/branches/${branchId}`, payload);
      router.push("/branch");
    } catch (error) {
      console.error("Error updating branch:", error);
    }
  };

  if (!branchData) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return (
    <BranchForm
      mode="update"
      initialData={branchData}
      onSubmit={handleUpdate}
      nameField="branches_name"
      nameLabel="Branch Name"
      cancelHref="/branch"
      dropdown={{
        label: "Company",
        name: "company_id",
        options: companies.map((c) => ({
          id: c.id,
          name: c.company_name,
        })),
      }}
    />
  );
}
