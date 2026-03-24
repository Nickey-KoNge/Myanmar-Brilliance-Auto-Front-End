"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import styles from "./Delete.module.css";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string; // The specific name (e.g., "Myanmar Brilliance Auto")
  name: string;     // The type of item (e.g., "Company")
  id: string;
  apiRoute: string; // e.g., "master-company/company"
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
  const [mounted, setMounted] = useState(false);

  // Ensure portal only renders on client side
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Prevent background scroll
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/${apiRoute}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete ${itemName}`);
      }

      onDeleteSuccess(id);
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className={styles.DeleteModal} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Top Icon Header */}
        <div className={styles.iconContaioner}>
          <div className={styles.iconOne}>
            <FontAwesomeIcon icon={faTriangleExclamation} className={styles.warningIcon} />
          </div>
          <button className={styles.iconTwo} onClick={onClose} disabled={isLoading}>
            <FontAwesomeIcon icon={faCircleXmark} />
          </button>
        </div>

        {/* Text Content */}
        <div className={styles.textContainer}>
          <h2 className={styles.confirmTitle}>Confirm Delete</h2>
          <p className={styles.description}>
            Are you sure you want to delete{" "}
            <span className={styles.highlight}>&quot;{itemName}&quot;</span>? 
            This action will remove the <strong>&quot;{name}&quot;</strong> record permanently.
          </p>
        </div>

        {/* Buttons */}
        <div className={styles.btnActionArea}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button className={styles.deleteBtn} onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}