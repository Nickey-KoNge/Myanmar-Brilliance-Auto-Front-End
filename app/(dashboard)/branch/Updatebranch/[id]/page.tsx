'use client'
import { useEffect, useState } from "react";
import { BranchForm } from "../../components/BranchForm/BranchForm";
import { useParams,useRouter } from "next/navigation";
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
  company:string;
  staff:string;
  stations:string;


}



export default function UpdateBranch() {
  const params = useParams();
  const branchId = params.id; 
  const router = useRouter();


 const [branchData, setBranchData] = useState<BranchFormData | undefined>(undefined);

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/master-company/branches/${branchId}`
        );
        const result = await response.json();
        console.log("Fetched Branch Data:", result); 

        // company is object but we need company_id for the form, so we extract it
        const transformedData={
          ...result.data,
          company_id: result.data.company?.id || "",
        }

        setBranchData(transformedData); 

      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranchData();
  }, [branchId]);


  const handleUpdate = async (data: BranchFormData) => {
    try {

      const { id,company,staff,stations,...filteredData}=data;
      const response = await fetch(
        `http://localhost:3001/master-company/branches/${branchId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filteredData),
        }
      );
      const result = await response.json();
      console.log("Branch updated:", result);

      if (response.ok) {
        router.push("/branch");
      }
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


