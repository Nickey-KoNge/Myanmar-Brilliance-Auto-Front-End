import React from "react";
import styles from "./layout.module.css";
import { SideNav } from "../components/layout/SideNav/SideNav";
import { TopNav } from "../components/layout/TopNav/TopNav";
import AlertListener from "../components/alert/AlertListener";
import { Toaster } from "react-hot-toast";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <SideNav />
      <main className={styles.mainContent}>
        <TopNav />
        <div className={styles.pageContent}>{children}</div>
      </main>
      <AlertListener />
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}
