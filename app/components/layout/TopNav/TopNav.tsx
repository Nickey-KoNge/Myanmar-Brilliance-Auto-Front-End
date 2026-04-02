"use client";
import React, { useEffect, useState } from "react";
import styles from "./TopNav.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faBell,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { useTheme } from "@/app/core/providers/ThemeProvider";
import Cookies from "js-cookie";

export const TopNav = () => {
  const { isLight, toggleTheme } = useTheme();
  const [userInfo, setUserInfo] = useState({
    name: "Loading...",
    image: "/default_staff.png",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        let imgUrl = "/default_staff.png";
        console.log("image", parsedUser["image"])
        if (parsedUser?.image) {
          imgUrl = parsedUser.image.includes("localhost:3000")
            ? parsedUser.image.replace("localhost:3000", "localhost:3001")
            : parsedUser.image;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserInfo({
          name: parsedUser?.staffName || parsedUser?.name || "User",
          image: imgUrl,
        });
      } catch (error) {
        console.error("Failed to parse user data:", error);
        setUserInfo({ name: "Unknown User", image: "/default_staff.png" });
      }
    } else {
      setUserInfo({ name: "Unknown User", image: "/default_staff.png" });
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    localStorage.removeItem("user_data");
    window.location.href = "/login";
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
          <button
            className={styles.themeToggle}
            aria-label="Toggle Theme"
            onClick={toggleTheme}
          >
            <FontAwesomeIcon
              icon={isLight ? faMoon : faSun}
              className={styles.toggleIcon}
            />
          </button>

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
                src={userInfo.image}
                alt="staff image"
                width={50}
                height={50}
                style={{ objectFit: "cover" }}
                unoptimized
              />
            </div>
            <span className={styles.userName}>{userInfo.name}</span>
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
