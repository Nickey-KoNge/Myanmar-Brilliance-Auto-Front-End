// app\components\ui\Input\Input.tsx
import React, { forwardRef } from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, ...props }, ref) => {
    return (
      <div className={styles.formGroup}>
        <label className={styles.label}>{label}</label>
        <div className={styles.inputWrapper}>
          <input
            className={`${styles.input} ${error ? styles.inputError : ""}`}
            ref={ref}
            {...props}
          />
          {icon && <span className={styles.iconWrapper}>{icon}</span>}
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
