"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GroupsForm } from "../components/GroupsForm/GroupForm";
import { apiClient } from "@/app/features/lib/api-client";

interface Station {
  id: string;
  station_name: string;
}
export default function AddGroupsPage() {
  const [station, setStations] = useState<Station[]>([]);
  useEffect(() => {
    const fetchStation = async () => {
      try {
        const response = await apiClient.get("master-company/stations");

        const result = response as { data?: Station[] | { data?: Station[] } };

        console.log("Fetched Stations:", result);

        if (result && Array.isArray(result.data)) {
          setStations(result.data);
        } else if (result && result.data && Array.isArray(result.data)) {
          setStations(result.data);
        } else {
          setStations([]);
        }
      } catch (error) {
        console.error("Error fetching stations:", error);
      }
    };
    fetchStation();
  }, []);

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: unknown) => {
    setLoading(true);

    try {
      await apiClient.post("/master-company/groups", data);
      router.push("/groups");
    } catch (error) {
      console.error("Error creating groups:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <GroupsForm
      mode="create"
      onSubmit={handleSubmit}
      nameField="group_name"
      nameLabel="Group Name"
      cancelHref="/groups"
      dropdown={{
        label: "Group",
        name: "station_id",
        options: station.map((s) => ({
          id: s.id,
          name: s.station_name,
        })),
      }}
      loading={loading}
    />
  );
}
