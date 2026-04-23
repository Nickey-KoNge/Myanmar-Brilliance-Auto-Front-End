import React, { forwardRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCaretDown, faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "./page.module.css";

export interface Option {
  id: string | number;
  name: string;
  [key: string]: any;
}

interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  valueKey?: keyof Option;
  nameKey?: keyof Option;
  leftIcon?: IconProp;
  rightIcon?: IconProp;
  placeholder?: string;
  isLoading?: boolean;
}

const DropdownInput = forwardRef<HTMLSelectElement, DropdownProps>(
  (
    {
      label,
      error,
      options = [],
      valueKey = "id",
      nameKey = "name",
      leftIcon,
      rightIcon = faCaretDown,
      placeholder,
      className,
      isLoading = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const currentRightIcon = isLoading ? faSpinner : rightIcon;

    return (
      <div className={`${styles.field} ${className || ""}`}>
        {label && <label className={styles.label}>{label}</label>}

        <div className={styles.inputWrapper}>
          {leftIcon && (
            <span className={styles.iconLeft}>
              <FontAwesomeIcon icon={leftIcon} />
            </span>
          )}

          <select
            ref={ref}
            disabled={disabled || isLoading}
            className={`
              ${styles.selectInput}
              ${leftIcon ? styles.withLeftIcon : ""}
              ${rightIcon ? styles.withRightIcon : ""}
              ${error ? styles.inputError : ""}
              ${isLoading ? styles.loadingSelect : ""}
            `}
            {...props}
          >
            {isLoading ? (
              <option value="">Loading options...</option>
            ) : (
              <>
                {placeholder && <option value="">{placeholder}</option>}
                {!placeholder && label && <option value="">All {label}</option>}
              </>
            )}

            {!isLoading &&
              options.map((opt) => (
                // <option key={opt[valueKey]} value={opt[valueKey]}>
                //   {opt[nameKey]}
                // </option>

                <option key={opt[valueKey]} value={String(opt[valueKey])}>
                  {opt[nameKey]}
                </option>
              ))}
          </select>

          {currentRightIcon && (
            <span
              className={`${styles.iconRight} ${isLoading ? styles.spin : ""}`}
              style={{ pointerEvents: "none" }}
            >
              <FontAwesomeIcon icon={currentRightIcon} spin={isLoading} />
            </span>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  },
);

DropdownInput.displayName = "DropdownInput";
export default DropdownInput;
