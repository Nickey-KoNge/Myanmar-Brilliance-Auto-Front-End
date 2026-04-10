import { ReactNode } from "react";
import styles from "./Column.module.css";

type ColumnProps = {
  title: string;
  count?: number | string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  searchSlot?: ReactNode;
  children: ReactNode;
};

export default function Column({
  title,
  count,
  leftIcon,
  rightIcon,
  searchSlot,
  children,
}: ColumnProps) {
  return (
    <div className={styles.column}>
      {/* Header Section */}
      <div className={styles.columnHeader}>
        <div className={styles.headerLeft}>
          {leftIcon && <span className={styles.iconWrapper}>{leftIcon}</span>}
          <span className={styles.titleText}>{title}</span>
          {count !== undefined && (
            <span className={styles.countBadge}>{count}</span>
          )}
        </div>

        {rightIcon && <div className={styles.headerRight}>{rightIcon}</div>}
      </div>

      {/* Search/Filter Section */}
      {searchSlot && <div className={styles.columnSearch}>{searchSlot}</div>}

      {/* Scrollable Body */}
      <div className={styles.columnBody}>{children}</div>
    </div>
  );
}
