"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GroupsForm } from "../components/GroupsForm/GroupForm";
import { apiClient } from "@/app/features/lib/api-client";

export default function AddGroupsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
  
    try {
      const payload = {
        ...data,
        status: "Active",
      };
  
      console.log("SEND DATA:", payload);
  
      const res = await apiClient.post("/group/create", payload);
  
      console.log("SUCCESS:", res);
  
      router.push("/groups");
    } catch (error: any) {
      console.error("ERROR:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };
  return <GroupsForm mode="create" onSubmit={handleSubmit} loading={loading} />;
}