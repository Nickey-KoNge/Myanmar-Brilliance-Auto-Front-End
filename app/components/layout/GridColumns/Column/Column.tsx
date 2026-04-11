import { ReactNode } from "react";
import styles from "./Column.module.css";

type ColumnProps = {
  title?: string;
  count?: number | string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  searchSlot?: ReactNode;
  filterSlot?: ReactNode;
  children?: ReactNode;
};

export default function Column({
  title,
  count,
  leftIcon,
  rightIcon,
  searchSlot,
  filterSlot,
  children,
}: ColumnProps) {
  return (
    <div className={styles.column}>
      {/* Header Section: Remains fixed at the top */}
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

      {/* Search Section: Remains fixed below the header */}
      {searchSlot && <div className={styles.columnSearch}>{searchSlot}</div>}
      {filterSlot && <div className={styles.columnFilter}>{filterSlot}</div>}

      {/* Body Section: This is the only part that scrolls */}
      <div className={styles.columnBody}>{children}</div>
    </div>
  );
}
