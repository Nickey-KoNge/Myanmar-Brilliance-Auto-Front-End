"use client";
import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import {
  faAdd,
  faCodeBranch, 
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/app/components/ui/Button/Button";
import { useEffect } from "react";
import React from "react";
import TableSearchLayout from "./TableSearchLayout";
import SearchModal from "./components/Search/SearchModal";

import { useRouter } from "next/navigation";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import { apiClient } from "@/app/features/lib/api-client";
import styles from "./page.module.css";
import DeleteModal from "../../components/ui/Delete/DeleteModal";
interface Branch{
  id:string;
  branches_name:string;
  company_id:string;
  company_name:string;
  gps_location:string;
  phone:string;
  description:string;
  fullAddress:string;
}


export default function BranchPage() {
  const router = useRouter();
  const [branchData, setBranchData] = React.useState<any[]>([]);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
const [selectedBranch, setSelectedBranch] = React.useState<Branch | null>(null);

  const hasFetched=React.useRef(false);

  const columns=[
    {
      header:"Branches Info",
      key:"branches_name",
     
    },
    {header:"Company",key:"company_name"},
    {header:"Location",key:"gps_location"},
    {header:"Address",key:"fullAddress"},
    {header:"Description",key:"description"},
    {header:"Phone",key:"phone"},
      {
      header: "Actions",
      key: "actions",
      render: (branch: Branch) => (
        <button
        className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click trigger
            setSelectedBranch(branch);
            setIsDeleteOpen(true);
          }}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      ),
    },



  ]


  const fetchBranchData = async () => {
    try {
      const response=await apiClient.get("/master-company/branches")

      setBranchData(response.data);

    }catch(error){
      console.error("Failed to fetch branch:",error)
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
        // table={<DynamicTable data={branchData} title="Branch" onDeleteSuccess={handleDeleteSuccess} />}
        table={<DataTable data={branchData} columns={columns} onRowClick={(branch)=>router.push(`/branch/Updatebranch/${branch.id}`)}/>}
        search={<SearchModal title="Branch" />}
      />
      {isDeleteOpen && selectedBranch && (
      <DeleteModal
    isOpen={isDeleteOpen}
    onClose={() => setIsDeleteOpen(false)}
    itemName={selectedBranch.branches_name}
    name="Branch"
    id={selectedBranch.id}
    apiRoute="master-company/branches"
    onDeleteSuccess={handleDeleteSuccess}
  />
)}


      
    </>
  );
}
