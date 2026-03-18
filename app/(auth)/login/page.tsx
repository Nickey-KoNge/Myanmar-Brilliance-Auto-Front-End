//app/(auth)/login/page.tsx;
"use client";
import React from "react";
import { LoginForm } from "@/app/features/auth/components/LoginForm";
import styles from "./page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/app/core/providers/ThemeProvider";
export default function LoginPage() {
  const { isLight, toggleTheme } = useTheme();
  return (
    <main className={styles.pageContainer}>
      <div className={styles.togglediv}>
        <button
          className={styles.themeToggle}
          aria-label="Toggle Theme"
          onClick={toggleTheme}
        >
          <FontAwesomeIcon icon={isLight ? faMoon : faSun} className={styles.toggleIcon} />
        </button>
      </div>

      <LoginForm />
    </main>
  );
}
