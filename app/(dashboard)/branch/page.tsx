"use client";
import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import {
  faAdd,
  faBrain,
  faCodeBranch,
  faCommentNodes,
  faRoute,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/app/components/ui/Button/Button";
import { useEffect } from "react";
import React from "react";
import TableSearchLayout from "./TableSearchLayout";
import SearchModal from "./components/Search/SearchModal";
import DynamicTable from "./components/Table/Table";
import { useRouter } from "next/navigation";

export default function BranchPage() {
  const router = useRouter();
  const [branchData, setBranchData] = React.useState<any[]>([]);


  const fetchBranchData = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/master-company/branches",
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log("API Response:", result); // Log the entire API response

      if (result && result.data && Array.isArray(result.data.data)) {
        setBranchData(result.data.data); // Extract the nested data array
        console.log("Branch Data Set:", result.data.data); // Log the extracted data
      } else {
        console.error("Invalid API response structure:", result);
        setBranchData([]); // Set an empty array if the structure is invalid
      }
    } catch (error) {
      console.error("Error fetching branch data:", error);
      setBranchData([]); // Set an empty array in case of an error
    }
  };

  useEffect(() => {
    fetchBranchData();
  }, []);

  console.log("Fetched Branch Data:", branchData);

  // const TestData= [
  //     {id:1, name:"Branch 1", location:"Yangon", DOB:"1990-01-01",location1:"Yangon",location2:"Earth",manager:"John Doe", vehicles:[{id:1, name:"Vehicle 1"}, {id:2, name:"Vehicle 2"}]},
  //     {id:2, name:"Branch 2", location:"Mandalay", DOB:"1985-05-15",location1:"Mandalay",location2:"Earth",manager:"Jane Doe", vehicles:[{id:3, name:"Vehicle 3"}]},
  //     {id:3, name:"Branch 3", location:"Naypyitaw", DOB:"1988-12-10",location1:"Naypyitaw",location2:"Earth",manager:"Jim Doe", vehicles:[{id:4, name:"Vehicle 4"}, {id:5, name:"Vehicle 5"}]},
  // ]


 // remove deleted branch from table data without refetching
  const handleDeleteSuccess=(id:string)=>{
    setBranchData((prevData)=>prevData.filter((row)=>row.id!==id));
  }

  const renderLiveButtonArea = (
    <div>
      {/* Add New Branch Button */}

      <Button onClick={()=>router.push("/branch/Addbranch")}>
        <FontAwesomeIcon icon={faAdd} />
        Add New Branch
      </Button>
    </div>
  );

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faCodeBranch} />,
          text: "Branch Management",
        }}
        actionNode={renderLiveButtonArea}
      />

      <TableSearchLayout
        table={<DynamicTable data={branchData} title="Branch" onDeleteSuccess={handleDeleteSuccess} />}
        search={<SearchModal title="Branch" />}
      />

      
    </>
  );
}
