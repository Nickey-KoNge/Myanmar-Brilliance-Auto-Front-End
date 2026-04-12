"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  GroupsForm,
  GroupsFormData,
} from "../../components/GroupsForm/GroupForm";
import { apiClient } from "@/app/features/lib/api-client";

interface Station {
  id: string;
  station_name: string;
}

export default function UpdateGroupPage() {
  const params = useParams();
  const groupId = params.id as string;
  const router = useRouter();

  const [groupData, setGroupData] = useState<GroupsFormData | undefined>(
    undefined,
  );
  const [station, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const response = await apiClient.get(
          `/master-company/groups/${groupId}`,
        );

        const rawData = (response as { data?: unknown }).data || response;
        const typedData = rawData as GroupsFormData;

        if (typedData) {
          setGroupData({
            ...typedData,
            station_id: typedData.station_id || "",
          });
        }
      } catch (error) {
        console.error("Error fetching Group data:", error);
      }
    };

    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const res = await apiClient.get("/master-company/stations");

        const raw = (res as { data?: unknown }).data || res;
        const stationArray = raw as Station[];

        setStations(Array.isArray(stationArray) ? stationArray : []);
      } catch (error) {
        console.error("Error fetching stations:", error);
      }
    };

    fetchStation();
  }, []);

  const handleUpdate = async (data: GroupsFormData) => {
    setLoading(true);
    try {
      const payload: Record<string, string> = {
        group_name: data.group_name,
        group_type: data.group_type,
        description: data.description || "",
      };

      if (data.station_id) {
        payload.station_id = data.station_id;
      }
      // delete payload.id;
      // delete payload.stations;

      // if (!payload.station_id) {
      //   delete payload.station_id;
      // }
      await apiClient.patch(`/master-company/groups/${groupId}`, payload);
      router.push("/groups");
    } catch (error) {
      console.error("Error updating groups:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!groupData) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return (
    <GroupsForm
      mode="update"
      initialData={groupData}
      onSubmit={handleUpdate}
      nameField="group_name"
      nameLabel="Group Name"
      cancelHref="/groups"
      dropdown={{
        label: "Stations",
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
