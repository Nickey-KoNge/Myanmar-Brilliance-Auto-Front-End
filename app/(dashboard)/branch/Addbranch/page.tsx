
'use client';
import { BranchForm } from "../components/BranchForm/BranchForm";
import { useRouter } from "next/navigation";

export default function AddBranchPage() {
  const router = useRouter();
  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch("http://localhost:3001/master-company/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      

      if (!response.ok) {
        throw new Error("Failed to create branch");
      }else {

        router.push("/branch");
      }

    } catch (error) {
      console.error("Error creating branch:", error);
    }
  };

   return <BranchForm mode="create" onSubmit={handleSubmit} />;
}