import React, { forwardRef } from "react";
import styles from "./page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: IconProp;
  rightIcon?: IconProp;
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    { label, error, leftIcon, rightIcon = faCalendarAlt, className, ...props },
    ref,
  ) => {
    return (
      <div className={`${styles.field} ${className || ""}`}>
        {label && <label className={styles.label}>{label}</label>}

        <div className={styles.inputWrapper}>
          {leftIcon && (
            <span className={styles.iconLeft}>
              <FontAwesomeIcon icon={leftIcon} />
            </span>
          )}

          <input
            ref={ref}
            type="date"
            className={`
              ${styles.dateInput}
              ${leftIcon ? styles.withLeftIcon : ""}
              ${rightIcon ? styles.withRightIcon : ""}
              ${error ? styles.inputError : ""}
            `}
            {...props}
          />

          {rightIcon && (
            <span
              className={styles.iconRight}
              style={{ pointerEvents: "none" }}
            >
              <FontAwesomeIcon icon={rightIcon} />
            </span>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  },
);

DateInput.displayName = "DateInput";
export default DateInput;
