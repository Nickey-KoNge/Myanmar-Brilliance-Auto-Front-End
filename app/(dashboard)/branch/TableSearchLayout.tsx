import React from "react";
import styles from "./TableSearch.module.css";

export default function TableSearchLayout({
  table,
  search,
}: {
  table: React.ReactNode;
  search: React.ReactNode;
}) {
  return (
    <div className={styles.tableSearchLayout}>
      <div className={styles.tableArea}>{table}</div>
      <div className={styles.searchArea}>{search}</div>
    </div>
  );
}