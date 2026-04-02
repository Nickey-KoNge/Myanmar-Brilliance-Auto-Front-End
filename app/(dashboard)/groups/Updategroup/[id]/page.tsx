"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GroupsForm, GroupsFormData } from "../../components/GroupsForm/GroupForm";
import { apiClient } from "@/app/features/lib/api-client";

export default function UpdateGroupPage() {
  const params = useParams();
  const id = params?.id as string;

  const router = useRouter();

  const [initialData, setInitialData] = useState<GroupsFormData | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch group data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res: any = await apiClient.get(`/master-group/group/${id}`);

        // ✅ IMPORTANT: map API response → form structure
        const mappedData: GroupsFormData = {
          id: res.id,
          station_id: res.station_id?.toString() || "",
          group_name: res.group_name || "",
          group_type: res.group_type || "",
          description: res.description || "",
        };

        setInitialData(mappedData);
      } catch (error) {
        console.error("Fetch failed:", error);
        alert("Failed to load group data");
        router.push("/groups"); // fallback
      }
    };

    fetchData();
  }, [id, router]);

  // ✅ Update handler
  const handleUpdate = async (formData: GroupsFormData) => {
    setLoading(true);

    try {
      await apiClient.put(`/master-group/group/${id}`, formData);

      alert("Updated successfully!");

      router.push("/groups");
    } catch (error) {
      console.error("Update error:", error);
      alert("Update failed!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loading state
  if (!initialData) {
    return <p style={{ padding: "20px" }}>Loading form...</p>;
  }

  return (
    <GroupsForm
      mode="update"
      initialData={initialData}
      onSubmit={handleUpdate}
      loading={loading}
    />
  );
}