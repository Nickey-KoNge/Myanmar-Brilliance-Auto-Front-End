import Link, { LinkProps } from "next/link";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import styles from "./Custom.module.css";

const VARIANT_MAP = {
  action: styles.actionBtn,
  success: styles.successBtn,
  cancel: styles.cancelBtn,
};

type NavigationBtnProps = {
  children: React.ReactNode;
  href: string;
  leftIcon?: IconProp;
  rightIcon?: IconProp;
  variant?: keyof typeof VARIANT_MAP;
  fullWidth?: boolean;
  className?: string;
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
  ...props
}: NavigationBtnProps) => {
  const linkClasses = [
    styles.btn,
    VARIANT_MAP[variant],
    fullWidth ? styles.fullWidth : styles.fitContent,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={linkClasses} {...props}>
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
    </Link>
  );
};

export default NavigationBtn;
