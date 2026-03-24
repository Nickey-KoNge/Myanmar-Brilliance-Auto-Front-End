import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import React, { forwardRef } from "react";
import styles from "./Custom.module.css";

const VARIANT_MAP = {
  action: styles.actionBtn,
  success: styles.successBtn,
  cancel: styles.cancelBtn,
};

type BaseProps = {
  leftIcon?: IconProp;
  rightIcon?: IconProp;
  variant?: keyof typeof VARIANT_MAP;
  loading?: boolean;
  fullWidth?: boolean;
};

type ButtonProps = BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

const ActionBtn = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      leftIcon,
      rightIcon,
      variant = "action",
      loading = false,
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    const buttonClasses = [
      styles.btn,
      VARIANT_MAP[variant],
      fullWidth ? styles.fullWidth : styles.fitContent,
      (disabled || loading) && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <FontAwesomeIcon
            icon={faCircleNotch}
            spin
            className={styles.spinner}
          />
        ) : (
          <>
            {leftIcon && (
              <span className={styles.icon}>
                <FontAwesomeIcon icon={leftIcon} />
              </span>
            )}

            <span className={styles.label}>{children}</span>

            {rightIcon && (
              <span className={styles.icon}>
                <FontAwesomeIcon icon={rightIcon} />
              </span>
            )}
          </>
        )}
      </button>
    );
  },
);

ActionBtn.displayName = "ActionBtn";

export default ActionBtn;
