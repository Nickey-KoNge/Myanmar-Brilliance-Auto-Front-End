"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import styles from "./Pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  showOnlyActions?: boolean;
  showOnlyInfo?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize = 10,
  onPageChange,
  showOnlyActions = false,
  showOnlyInfo = false,
}) => {
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className={styles.paginationContainer}>
      {!showOnlyActions && (
        <div className={styles.infoText}>
          <span>Showing </span>
          <span className={styles.spanText}>{endRecord}</span>
          <span> of </span>
          <span className={styles.spanText}>{totalRecords}</span>
          <span> total records</span>
        </div>
      )}

      {!showOnlyInfo && (
        <div className={styles.actionsContainer}>
          <div className={styles.pageInfo}>
            Page <span className={styles.spanText}>{currentPage}</span> of{" "}
            <span className={styles.spanText}>{totalPages || 1}</span>
          </div>
          <div className={styles.btnGroup}>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={styles.pageBtn}
            >
              <FontAwesomeIcon icon={faAngleLeft} />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= (totalPages || 1)}
              className={styles.pageBtn}
            >
              <FontAwesomeIcon icon={faAngleRight} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
