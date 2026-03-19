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
  const hasFetched=React.useRef(false);


  const fetchBranchData = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/master-company/branches",
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result && result.data && Array.isArray(result.data.data)) {
        setBranchData(result.data.data); // Extract the nested data array
       
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
    if(hasFetched.current) return;
    hasFetched.current=true;
    fetchBranchData();
  }, []);

  console.log("Fetched Branch Data:", branchData);

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
