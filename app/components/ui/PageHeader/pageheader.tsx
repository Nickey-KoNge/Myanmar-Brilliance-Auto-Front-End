// src/components/ui/PageHeader/pageheader.tsx
import React from "react";
import styles from "./pageheader.module.css";

interface PageHeaderProps {

  titleData: {
    icon: React.ReactNode;
    text: string;
    description?: string;
  };
 
  actionNode?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  titleData,
  actionNode,
}) => {
  return (
    <div className={styles.headerContainer}>
      
      <div className={styles.titleWrapper}>
        <div className={styles.titleIconWrapper}>{titleData.icon}</div>
        <div className={styles.titleTextWrapper}>
          <h1 className={styles.title}>{titleData.text}</h1>
          {titleData.description && (
            <p className={styles.description}>{titleData.description}</p>
          )}
        </div>
      </div>
    
      <div className={styles.actionArea}>{actionNode}</div>
    </div>
  );
};
