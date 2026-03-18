import React, { useState } from "react";
import styles from "./Table.module.css";
import { useRouter } from "next/navigation";
import DeleteModal from "../Delete/DeleteModal";

export default function DynamicTable({
  data,
  title,
  onDeleteSuccess,
}: {
  data: any[];
  title: string;
  onDeleteSuccess:(id:string)=>void;
}) {
  const router = useRouter();

  const [showDeleteModal, setShowDeleteModal] =useState(false);
  const [selectedRow, setSelectedRow] = useState<string|any>(null);

  
  const closeModal=()=>{
  
    setShowDeleteModal(false)
    setSelectedRow(null);
  };

  const openDeleteModal=(rowId:string)=>{
    setSelectedRow(rowId);
    setShowDeleteModal(true);
  }



  if (!Array.isArray(data) || data.length === 0)
    return <p>No data available</p>;

  const columns = Object.keys(data[0] || {}).filter(
    (col) => col !== "id" && col !=="company_id" ,
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title} Master Records</h2>
      <div className={styles["table-scroll"]}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className={styles.col}>
                  {col.replace("_", " ")}
                </th>
              ))}
              <th className={styles.col}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                onClick={() => router.push(`/branch/Updatebranch/${row.id}`)}
              >
                {columns.map((col) => (
                  <td key={col} className={styles.colData}>
                    {row[col]}
                  </td>
                ))}

            
                <td className={styles.actions}>
                  <button className={styles.deleteBtn}
                    onClick={(e)=>{
                    e.stopPropagation();//prevent for row click
               
                    openDeleteModal(row.id);
                    

                   
                  }}>🗑</button>
                </td>
                   
              </tr>
            ))}
          </tbody>
        </table>
       
      </div>
      {showDeleteModal && <DeleteModal isOpen={showDeleteModal} onClose={closeModal} id={selectedRow} onDeleteSuccess={onDeleteSuccess} />}
  
    </div>
  );
}
