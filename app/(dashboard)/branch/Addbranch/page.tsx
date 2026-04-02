"use client";
import { BranchForm } from "../components/BranchForm/BranchForm";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/features/lib/api-client";
import { useEffect, useState } from "react";


interface Company {
  id: string;
  company_name: string;
}

export default function AddBranchPage() {
const [companies, setCompanies] = useState<Company[]>([]);

    useEffect(() => {
      const fetchCompanies = async () => {
        try {
          const response = await apiClient.get("/master-company/company");
  
          const result = response as { data?: Company[] | { data?: Company[] } };
  
          console.log("Fetched Companies:", result);
  
          if (result && Array.isArray(result.data)) {
            setCompanies(result.data);
          } else if (result && result.data && Array.isArray(result.data)) {
            setCompanies(result.data);
          } else {
            setCompanies([]);
          }
        } catch (error) {
          console.error("Error fetching companies:", error);
        }
      };
      fetchCompanies();
    }, []);
  const router = useRouter();
  const handleSubmit = async (data: unknown) => {
    try {
      await apiClient.post("/master-company/branches", data);
      router.push("/branch");
    } catch (error) {
      console.error("Error creating branch:", error);
    }
  };

  return <BranchForm
  mode="create"
  onSubmit={handleSubmit}
  nameField="branches_name"
  nameLabel="Branch Name"
  cancelHref="/branch"
  dropdown={{
    label: "Company",
    name: "company_id",
    options: companies.map(c => ({
      id: c.id,
      name: c.company_name,
    })),
  }}
/>;
}
