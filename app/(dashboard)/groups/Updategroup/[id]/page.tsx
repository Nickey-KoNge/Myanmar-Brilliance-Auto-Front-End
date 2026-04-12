"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  GroupsForm,
  GroupsFormData,
} from "../../components/GroupsForm/GroupForm";
import { apiClient } from "@/app/features/lib/api-client";
import { FieldValues } from "react-hook-form";

interface GroupFormData {
  [key: string]: string | undefined;
  group_name: string;
  group_type: string;
  station_id: string;
  id: string;
  description: string;
  stations?: string;
}
interface Station {
  id: string;
  station_name: string;
}
export default function UpdateGroupPage() {
  const params = useParams();
  const groupId = params.id;
  const router = useRouter();

  const [groupData, setGroupData] = useState<GroupsFormData | undefined>(
    undefined,
  );
  const [station, setStations] = useState<Station[]>([]);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const response = await apiClient.get(
          `/master-company/groups/${groupId}`,
        );

        const rawData = (response as { data?: unknown }).data || response;
        const typedData = rawData as GroupFormData;

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
        console.log("Fetched stations:", stationArray);
      } catch (error) {
        console.error("Error fetching stations:", error);
      }
    };

    fetchStation();
  }, []);

  const handleUpdate = async (data: FieldValues) => {
    try {
      const payload = { ...data };
      delete payload.id;
      delete payload.stations;

      if (!payload.station_id) {
        delete payload.station_id
      }

      await apiClient.patch(`/master-company/groups/${groupId}`, payload);
      router.push("/groups");
    } catch (error) {
      console.error("Error updating groups:", error);
    }
  };

  if (!groupData) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
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
