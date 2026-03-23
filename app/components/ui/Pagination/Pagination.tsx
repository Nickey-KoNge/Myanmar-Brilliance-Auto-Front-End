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
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize = 10,
  onPageChange,
}) => {
  // လက်ရှိ Page ပေါ်မူတည်ပြီး ဘယ်ကနေ ဘယ်အထိ ပြနေလဲဆိုတာကို တွက်ချက်ခြင်း
  const startRecord = totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className={styles.paginationContainer}>
      {/* ဘယ်ဘက်ခြမ်း - အချက်အလက်ပြသမှု */}
      <div className={styles.infoText}>
        <span>Showing </span>
        <span className={styles.spanText}>{startRecord}</span>
        <span> to </span>
        <span className={styles.spanText}>{endRecord}</span>
        <span> of </span>
        <span className={styles.spanText}>{totalRecords}</span>
        <span> total records</span>
      </div>

      {/* ညာဘက်ခြမ်း - ခလုတ်များနှင့် စာမျက်နှာအချက်အလက် */}
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
            aria-label="Previous Page"
          >
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= (totalPages || 1)}
            className={styles.pageBtn}
            aria-label="Next Page"
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
        </div>
      </div>
    </div>
  );
};
