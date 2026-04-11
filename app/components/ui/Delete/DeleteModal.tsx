import React, { useState } from "react";
import { Button } from "@/app/components/ui/Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faWarning } from "@fortawesome/free-solid-svg-icons";
import styles from "./Delete.module.css";
import { apiClient } from "@/app/features/lib/api-client";

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
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await apiClient.delete(`/${apiRoute}/${id}`);

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
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.DeleteModal}>
        <div className={styles.iconContainer}>
          <div className={styles.iconOne}>
            <div className={styles.warningIcon}>
              <FontAwesomeIcon icon={faWarning} color="red" size="xl" />
            </div>
          </div>
          <div className={styles.iconTwo}>
            <FontAwesomeIcon
              icon={faCircleXmark}
              onClick={onClose}
              style={{ color: "#A33B3B" }}
            />
          </div>
        </div>
        <div className={styles.textContainer}>
          <span>Confirm Delete</span>

          <span>
            Are you sure you want to delete{" "}
            <span style={{ color: "red" }}>&quot;{itemName}&quot;</span>? This
            action will remove the <strong>&quot;{name}&quot;</strong> record
            permanently.
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
