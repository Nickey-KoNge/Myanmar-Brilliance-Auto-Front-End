import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import React, { forwardRef } from "react";
import styles from "./Custom.module.css";

const VARIANT_MAP = {
  action: styles.actionBtn,
  success: styles.successBtn,
  cancel: styles.cancelBtn,
  info: styles.infoBtn,
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
      type,
      ...props
    },
    ref,
  ) => {
    const hasText =
      typeof children === "string"
        ? children.trim().length > 0
        : Boolean(children);

    const buttonClasses = [
      styles.btn,
      VARIANT_MAP[variant],
      fullWidth ? styles.fullWidth : styles.fitContent,
      (disabled || loading) && styles.disabled,
      hasText && styles.withText,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={buttonClasses}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {/* Spinner overlay */}
        {loading && (
          <FontAwesomeIcon
            icon={faCircleNotch}
            spin
            className={styles.spinner}
          />
        )}

        {/* Content (keeps width, hidden during loading) */}
        <span className={loading ? styles.contentHidden : styles.content}>
          {leftIcon && (
            <span className={styles.icon}>
              <FontAwesomeIcon icon={leftIcon} />
            </span>
          )}

          {hasText && <span className={styles.label}>{children}</span>}

          {rightIcon && (
            <span className={styles.icon}>
              <FontAwesomeIcon icon={rightIcon} />
            </span>
          )}
        </span>
      </button>
    );
  },
);

ActionBtn.displayName = "ActionBtn";

export default ActionBtn;
