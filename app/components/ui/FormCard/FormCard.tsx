// src/components/ui/FormCard/FormCard.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import styles from "./FormCard.module.css"; 

interface FormCardProps {
  title: string;
  icon: IconProp;
  children: React.ReactNode;
}

export const FormCard: React.FC<FormCardProps> = ({
  title,
  icon,
  children,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionBar} />
        <div className={styles.sectionIcon}>
          <FontAwesomeIcon icon={icon} />
        </div>
        <span className={styles.sectionTitle}>{title}</span>
      </div>
      {/* ဤနေရာတွင် input များ ဝင်လာမည် */}
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
};
