"use client";
import { useEffect, useState } from "react";
import { BranchForm } from "../../components/BranchForm/BranchForm";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/app/features/lib/api-client";
interface BranchFormData {
  branches_name: string;
  gps_location: string;
  phone: string;
  division: string;
  city: string;
  address: string;
  description: string;
  company_id: string;
  id: string;
  company: string;
  staff: string;
  stations: string;
}

export default function UpdateBranch() {
  const params = useParams();
  const branchId = params.id;
  const router = useRouter();

  const [branchData, setBranchData] = useState<BranchFormData | undefined>(
    undefined,
  );

  // useEffect(() => {
  //   const fetchBranchData = async () => {
  //     try {
  //       const response = await fetch(
  //         `http://localhost:3001/master-company/branches/${branchId}`,
  //       );
  //       const result = await response.json();
  //       console.log("Fetched Branch Data For Update:", result);

  //       setBranchData(result.data);
  //     } catch (error) {
  //       console.error("Error fetching branch data:", error);
  //     }
  //   };

  //   fetchBranchData();
  // }, [branchId]);
  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await apiClient.get(
          `/master-company/branches/${branchId}`,
        );

        const rawData = (response as { data?: unknown }).data || response;
        const typedData = rawData as BranchFormData;

        if (typedData) {
          const formattedData: BranchFormData = {
            ...typedData,
            company_id: typedData.company_id || "",
          };
          setBranchData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    if (branchId) {
      fetchBranchData();
    }
  }, [branchId]);

  const handleUpdate = async (data: BranchFormData) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, company, staff, stations, ...filteredData } = data;

      const payload: Partial<BranchFormData> = { ...filteredData };
      if (!payload.company_id) {
        delete payload.company_id;
      }

      await apiClient.patch(`/master-company/branches/${branchId}`, payload);

      console.log("Branch updated successfully");
      router.push("/branch");
    } catch (error) {
      console.error("Error updating branch:", error);
    }
  };

  return !branchData ? (
    <div>Loading...</div>
  ) : (
    <BranchForm
      mode="update"
      initialData={branchData}
      onSubmit={handleUpdate}
    />
  );
}
