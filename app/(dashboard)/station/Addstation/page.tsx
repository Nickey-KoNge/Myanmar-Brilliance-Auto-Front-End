"use client";
import { BranchForm } from "@/app/(dashboard)/branch/components/BranchForm/BranchForm";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/features/lib/api-client";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";

interface Branch {
  id: string;
  branches_name: string;
}
interface BranchResponse {
  data?: Branch[] | { data?: Branch[] };
}
export default function AddBranchPage() {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await apiClient.get("/master-company/branches");

        // const result = response as { data?: Branch[] | { data?: Branch[] } };
        const result = response as unknown as BranchResponse;
        console.log("Fetched Branches:", result);

        if (result && Array.isArray(result.data)) {
          setBranches(result.data);
        } else if (result && result.data && Array.isArray(result.data)) {
          setBranches(result.data);
        } else {
          setBranches([]);
        }
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.log("FULL ERROR:", error.response?.data);
        } else {
          console.log("An unexpected error occurred:", error);
        }
      }
    };
    fetchBranches();
  }, []);

  const router = useRouter();
  const handleSubmit = async (data: unknown) => {
    try {
      await apiClient.post("/master-company/stations", data);
      router.push("/station");
    } catch (error) {
      console.error("Error creating station:", error);
    }
  };

  return (
    <BranchForm
      mode="create"
      onSubmit={handleSubmit}
      nameField="station_name"
      nameLabel="Station Name"
      cancelHref="/station"
      dropdown={{
        label: "Branch",
        name: "branches_id",
        options: branches.map((b) => ({
          id: b.id,
          name: b.branches_name,
        })),
      }}
    />
  );
}
