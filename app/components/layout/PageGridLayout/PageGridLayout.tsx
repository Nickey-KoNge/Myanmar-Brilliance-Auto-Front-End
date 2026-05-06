import React from "react";
import styles from "./PageGridLayout.module.css";

interface PageGridLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  isSidebarOpen?: boolean;
}

export function PageGridLayout({
  children,
  sidebar,
  isSidebarOpen,
}: PageGridLayoutProps) {
  return (
    <div
      className={`${styles.gridContainer} ${
        isSidebarOpen ? styles.withGap : styles.noGap
      }`}
    >
      <section className={styles.gridBox}>
        <div className={styles.spacer}>{children}</div>
      </section>

      <aside
        className={`${styles.gridBox} ${
          isSidebarOpen ? styles.open : styles.closed
        }`}
      >
        {sidebar}
      </aside>
    </div>
  );
}