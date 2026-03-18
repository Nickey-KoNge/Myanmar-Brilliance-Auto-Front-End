"use client";
import React from "react";
import styles from "./TopNav.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faBell,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { useTheme } from "@/app/core/providers/ThemeProvider";

export const TopNav = () => {
  const { isLight, toggleTheme } = useTheme();
  return (
    <header className={styles.topbar}>
      <div className={styles.companyInfo}>
        <div className={styles.logoIcon}>
          <Image
            src="/companylogo.jpeg"
            alt="Company Logo"
            width={50}
            height={50}
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={styles.logobrand}>
          MYANMAR BRILLIANCE <span>AUTO</span>
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.togglediv}>
          <div className={styles.iconBtn} onClick={toggleTheme} style={{cursor: 'pointer'}}>
            <FontAwesomeIcon icon={isLight ? faMoon : faSun} />
          </div>

          <div className={styles.alertBtn}>
            <FontAwesomeIcon icon={faBell} />
            <span className={styles.badge}>1</span>
          </div>
        </div>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            <Image
              src="/staff.png"
              alt="staff image"
              width={50}
              height={50}
              style={{ objectFit: "cover" }}
            />
          </div>
          <span className={styles.userName}>STEVEN JOHN</span>
          <FontAwesomeIcon
            icon={faChevronDown}
            style={{ width: "10px", color: "#888" }}
          />
        </div>
      </div>
    </header>
  );
};
