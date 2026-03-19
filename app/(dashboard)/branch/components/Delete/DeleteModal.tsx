import React, { use, useEffect } from "react";
import { useState } from "react";
import { Button } from "@/app/components/ui/Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCancel, faCircleXmark, faCross, faWarning } from "@fortawesome/free-solid-svg-icons";
import styles from "./Delete.module.css";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  name: string;
  isLoading?: boolean;
  id: string;
  apiRoute: string;
  onDeleteSuccess: (id: string) => void;
}

export default function DeleteModal({
  isOpen,
  onClose,
  itemName,
  name,
  id,
  apiRoute,
  onDeleteSuccess,
}: DeleteModalProps) {
  //   const [branchData, setBranchData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);
 
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/${apiRoute}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete ${name}`);
      }

      onDeleteSuccess(id);
      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      alert(message);
      console.error(`Error deleting ${name}:`, error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className={styles.DeleteModal}>
        <div className={styles.iconContainer}>
          <div className={styles.iconOne}>
            <div className={styles.warningIcon}>
                <FontAwesomeIcon icon={faWarning} color="red" size="xl" />
            </div>
          
          </div>
          <div className={styles.iconTwo}>
            
            
            <FontAwesomeIcon icon={faCircleXmark}  onClick={onClose} style={{color:"#A33B3B"}}  />
          </div>
        </div>
        <div className={styles.textContainer}>
          <span>Confirm Delete</span>

          <span>
            Are you sure you want to delete{""}
            <span style={{ color: "red" }}>&quot;{itemName}&quot;</span>
             `This action will remove the <strong>
              &quot; {name} &quot;
            </strong>{" "}
            record permanently.
          </span>
        </div>
        <div className={styles.btnContainer}>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : `Delete`}
          </Button>
        </div>
      </div>
    </>
  );
}