"use client";
import React from "react";
import styles from "./TopNav.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faBell,
  faChevronDown,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { useTheme } from "@/app/core/providers/ThemeProvider";
import Cookies from "js-cookie"; // Cookie ဖျက်ရန် import လုပ်ပါ

export const TopNav = () => {
  const { isLight, toggleTheme } = useTheme();

  // Logout လုပ်ဆောင်ချက်
  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    window.location.href = "/login"; // Login page သို့ ပြန်ပို့ပါ
  };

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
          <div
            className={styles.iconBtn}
            onClick={toggleTheme}
            style={{ cursor: "pointer" }}
          >
            <FontAwesomeIcon icon={isLight ? faMoon : faSun} />
          </div>

          <div className={styles.alertBtn}>
            <FontAwesomeIcon icon={faBell} />
            <span className={styles.badge}>1</span>
          </div>
        </div>

        {/* User Profile နှင့် Logout Area */}
        <div className={styles.userSection}>
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
          </div>

          {/* Logout Button */}
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Logout"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </div>
    </header>
  );
};
