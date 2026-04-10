import { ReactNode } from "react";
import styles from "./GridColumnLayout.module.css";

type GridColumnsLayoutProps = {
  children: ReactNode;
};

export default function GridColumnsLayout({
  children,
}: GridColumnsLayoutProps) {
  return <div className={styles.container}>{children}</div>;
}
