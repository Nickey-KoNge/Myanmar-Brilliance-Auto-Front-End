import React, { use, useEffect } from 'react'
import { useState } from 'react';
import { Button } from '@/app/components/ui/Button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCancel, faCircleChevronRight, faClose, faCross, faTrashAlt, faWarning } from '@fortawesome/free-solid-svg-icons';
import styles from './Delete.module.css';

interface DeleteModalProps{
    isOpen:boolean;
    onClose:()=>void;
    id:string;
    onDeleteSuccess?:(id:string)=>void;
}

export default function DeleteModal({isOpen,onClose,id,onDeleteSuccess}:DeleteModalProps) {
    const [branchData, setBranchData] = useState<any>(null);
    if(!isOpen) return null;
    const fetchBranchData = async () => {
        try {
          const response = await fetch(
              `http://localhost:3001/master-company/branches/${id}`
          );
          const result = await response.json();
          console.log("Fetched Branch Data:", result);
         setBranchData(result.data);
        } catch (error) {
          console.error("Error fetching branch data:", error);
        }
    };
   
    useEffect(()=>{
        if(isOpen&&id){
            fetchBranchData();
        
    }},[isOpen,id])
    console.log("Branch Data in Modal:", branchData);

    const handleDelete=async()=>{
        try {
            const response = await fetch(
                `http://localhost:3001/master-company/branches/${id}`,
                {
                    method:"DELETE",
                }
            );
            if(!response.ok){
                throw new Error("Failed to delete branch");
            }
            onDeleteSuccess?.(id);
            onClose();
        } catch (error) {
            console.error("Error deleting branch:", error);
        }
    }
 


  
    return (
        <>
        <div className={styles.DeleteModal}>
            <div className={styles.iconContainer}>
                <div className={styles.iconOne}>
                          <FontAwesomeIcon icon={faWarning} color='red' size='xl'/>
                </div>
                <div className={styles.iconTwo}>

                     <FontAwesomeIcon icon={faCancel}/>
                </div>
    
            </div>
            <div className={styles.textContainer}>
                   <span>Confirm Delete</span>
            
            <span>Are you sure you want to delete<span style={{color:'red'}}> "{branchData?.branches_name}"?</span> This action will remove the Branches record permanently from the database.</span>
         


            </div>
            <div className={styles.btnContainer}>
                  <Button onClick={onClose}>No, Cancel</Button>
          <Button onClick={handleDelete}>Yes, Delete</Button>
                 

            </div>
           
        </div>
        
        </>
    )
   
}
