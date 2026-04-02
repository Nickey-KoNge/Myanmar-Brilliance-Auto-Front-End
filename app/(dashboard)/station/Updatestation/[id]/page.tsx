"use client";
import { useEffect, useState } from "react";
import { BranchForm } from "@/app/(dashboard)/branch/components/BranchForm/BranchForm";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/app/features/lib/api-client";
import { FieldValues } from "react-hook-form";

interface StationFormData {
  [key: string]: string | undefined;
  station_name: string;
  gps_location: string;
  phone: string;
  division: string;
  city: string;
  address: string;
  description: string;
  branches_id: string;
  id: string;
  branches: string;
  branches_name: string;
}
interface Branch {
  id: string;
  branches_name: string;
}

export default function UpdateBranch() {
  const params = useParams();
  const stationId = params.id;
  const router = useRouter();

  const [stationData, setStationData] = useState<StationFormData | undefined>(
    undefined,
  );

  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const fetchStationData = async () => {
      try {
        const response = await apiClient.get(
          `/master-company/stations/${stationId}`,
        );

        // TypeScript error 2352 ကို ရှောင်ရန် unknown သို့ အရင် cast လုပ်ပါ
        const rawData = (response as { data?: unknown }).data || response;
        const typedData = rawData as StationFormData;

        if (typedData) {
          setStationData({
            ...typedData,
            branches_id: typedData.branches_id || "",
          });
        }
      } catch (error) {
        console.error("Error fetching station data:", error);
      }
    };

    if (stationId) {
      fetchStationData();
    }
  }, [stationId]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await apiClient.get("/master-company/branches");

        // Error 2352 ရှင်းရန်: unknown အရင်ခံပြီးမှ Branch[] ဖြစ်ကြောင်း cast လုပ်ပါ
        const raw = (res as { data?: unknown }).data || res;
        const branchArray = raw as Branch[];

        setBranches(Array.isArray(branchArray) ? branchArray : []);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  const handleUpdate = async (data: FieldValues) => {
    try {
      // ESLint unused-vars error ရှင်းရန်:
      // destructuring လုပ်မယ့်အစား မလိုတဲ့ key တွေကို delete လုပ်လိုက်တာက ပိုသန့်ရှင်းပါတယ်
      const payload = { ...data };
      delete payload.id;
      delete payload.branches;
      delete payload.branches_name;

      if (!payload.branches_id) {
        delete payload.branches_id;
      }

      await apiClient.patch(`/master-company/stations/${stationId}`, payload);
      router.push("/station");
    } catch (error) {
      console.error("Error updating station:", error);
    }
  };

  if (!stationData) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return (
    <BranchForm
      mode="update"
      initialData={stationData}
      onSubmit={handleUpdate}
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
