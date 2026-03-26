"use client";
import { BranchForm } from "../components/BranchForm/BranchForm";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/features/lib/api-client";

export default function AddBranchPage() {
  const router = useRouter();
  const handleSubmit = async (data: unknown) => {
    try {
      await apiClient.post("/master-company/branches", data);
      router.push("/branch");
    } catch (error) {
      console.error("Error creating branch:", error);
    }
  };

  return <BranchForm mode="create" onSubmit={handleSubmit} />;
}
