import Link, { LinkProps } from "next/link";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import styles from "./Custom.module.css";

const VARIANT_MAP = {
  action: styles.actionBtn,
  success: styles.successBtn,
  cancel: styles.cancelBtn,
  info: styles.infoBtn,
};

type NavigationBtnProps = {
  children?: React.ReactNode;
  href: string;
  leftIcon?: IconProp;
  rightIcon?: IconProp;
  variant?: keyof typeof VARIANT_MAP;
  fullWidth?: boolean;
  className?: string;
  isLoading?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  LinkProps;

const NavigationBtn = ({
  children,
  href,
  leftIcon,
  rightIcon,
  variant = "action",
  fullWidth = false,
  className = "",
  isLoading = false,
  ...props
}: NavigationBtnProps) => {
  const hasText =
    typeof children === "string"
      ? children.trim().length > 0
      : Boolean(children);

  const linkClasses = [
    styles.btn,
    VARIANT_MAP[variant],
    fullWidth ? styles.fullWidth : styles.fitContent,
    hasText && styles.withText,
    isLoading && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={linkClasses} {...props}>
      {isLoading && (
        <span className={styles.spinner}>
          <FontAwesomeIcon icon={faSpinner} spin />
        </span>
      )}
      <span className={isLoading ? styles.contentHidden : styles.content}>
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
    </Link>
  );
};

export default NavigationBtn;