import React from "react";
import styles from "./SummaryCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  title: string;
  value: string;
  subtitle: string;
  status: "success" | "danger" | "neutral";
  icon: any;
}
export const SummaryCard = ({
  title,
  value,
  subtitle,
  status,
  icon,
}: Props) => (
  <div className={styles.card}>
    <div>
      <div className={styles.title}>{title}</div>
      <div className={styles.value}>{value}</div>
      <div className={`${styles.subtitle} ${styles[status]}`}>{subtitle}</div>
    </div>
    <div className={styles.iconBox}>
      <FontAwesomeIcon icon={icon} />
    </div>
  </div>
);
