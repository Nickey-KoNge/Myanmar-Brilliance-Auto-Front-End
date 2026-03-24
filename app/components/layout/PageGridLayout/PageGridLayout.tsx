import React from "react";
import styles from "./PageGridLayout.module.css";

interface PageGridLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function PageGridLayout({ children, sidebar }: PageGridLayoutProps) {
  return (
    <div className={styles.gridContainer}>
      <section className={styles.gridBox}>
        <div className={styles.spacer}>{children}</div>
      </section>

      <aside className={styles.gridBox}>{sidebar}</aside>
    </div>
  );
}
