import React from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, icon, ...props }) => {
  return (
    <button className={styles.btn} {...props}>
      {icon && <span className={styles.iconWrapper}>{icon}</span>}
      {children}
    </button>
  );
};
