// "use client";
// import React, { useEffect, useState } from "react";
// import styles from "./TopNav.module.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faSun,
//   faMoon,
//   faBell,
//   faSignOutAlt,
// } from "@fortawesome/free-solid-svg-icons";
// import Image from "next/image";
// import { useTheme } from "@/app/core/providers/ThemeProvider";
// import Cookies from "js-cookie";

// export const TopNav = () => {
//   const { isLight, toggleTheme } = useTheme();
//   const [userInfo, setUserInfo] = useState({
//     name: "Loading...",
//     image: "/default_staff.png",
//   });

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user_data");
//     if (storedUser && storedUser !== "undefined") {
//       try {
//         const parsedUser = JSON.parse(storedUser);
//         let imgUrl = "/default_staff.png";
//         console.log("image", parsedUser["image"])
//         if (parsedUser?.image) {
//           imgUrl = parsedUser.image.includes("localhost:3000")
//             ? parsedUser.image.replace("localhost:3000", "localhost:3001")
//             : parsedUser.image;
//         }
//         // eslint-disable-next-line react-hooks/set-state-in-effect
//         setUserInfo({
//           name: parsedUser?.staffName || parsedUser?.name || "User",
//           image: imgUrl,
//         });
//       } catch (error) {
//         console.error("Failed to parse user data:", error);
//         setUserInfo({ name: "Unknown User", image: "/default_staff.png" });
//       }
//     } else {
//       setUserInfo({ name: "Unknown User", image: "/default_staff.png" });
//     }
//   }, []);

//   const handleLogout = () => {
//     Cookies.remove("access_token");
//     Cookies.remove("refresh_token");
//     localStorage.removeItem("user_data");
//     window.location.href = "/login";
//   };

//   return (
//     <header className={styles.topbar}>
//       <div className={styles.companyInfo}>
//         <div className={styles.logoIcon}>
//           <Image
//             src="/companylogo.jpeg"
//             alt="Company Logo"
//             width={50}
//             height={50}
//             style={{ objectFit: "cover" }}
//           />
//         </div>
//         <div className={styles.logobrand}>
//           MYANMAR BRILLIANCE <span>AUTO</span>
//         </div>
//       </div>

//       <div className={styles.actions}>
//         <div className={styles.togglediv}>
//           <button
//             className={styles.themeToggle}
//             aria-label="Toggle Theme"
//             onClick={toggleTheme}
//           >
//             <FontAwesomeIcon
//               icon={isLight ? faMoon : faSun}
//               className={styles.toggleIcon}
//             />
//           </button>

//           <div className={styles.alertBtn}>
//             <FontAwesomeIcon icon={faBell} />
//             <span className={styles.badge}>1</span>
//           </div>
//         </div>

//         {/* User Profile နှင့် Logout Area */}
//         <div className={styles.userSection}>
//           <div className={styles.userProfile}>
//             <div className={styles.avatar}>
//               <Image
//                 src={userInfo.image}
//                 alt="staff image"
//                 width={50}
//                 height={50}
//                 style={{ objectFit: "cover" }}
//                 unoptimized
//               />
//             </div>
//             <span className={styles.userName}>{userInfo.name}</span>
//           </div>

//           {/* Logout Button */}
//           <button
//             className={styles.logoutBtn}
//             onClick={handleLogout}
//             title="Logout"
//           >
//             <FontAwesomeIcon icon={faSignOutAlt} />
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

// old code

// "use client";
// // useRef ကို အသုံးမပြုတော့လို့ ဖယ်လိုက်ပါပြီ
// import React, { useEffect, useState } from "react";
// import styles from "./TopNav.module.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faSun,
//   faMoon,
//   faBell,
//   faSignOutAlt,
//   faIdCardClip,
//   faTaxi,
//   faChevronDown,
// } from "@fortawesome/free-solid-svg-icons";
// import Image from "next/image";
// import Link from "next/link";
// import { useTheme } from "@/app/core/providers/ThemeProvider";
// import Cookies from "js-cookie";

// export const TopNav = () => {
//   const { isLight, toggleTheme } = useTheme();
//   const [isRentalOpen, setIsRentalOpen] = useState(false);
//   const [userInfo, setUserInfo] = useState({
//     name: "Loading...",
//     image: "/default_staff.png",
//   });

//   useEffect(() => {
//     const loadUserData = () => {
//       const storedUser = localStorage.getItem("user_data");

//       if (!storedUser || storedUser === "undefined") {
//         setUserInfo({ name: "Unknown User", image: "/default_staff.png" });
//         return;
//       }

//       try {
//         const parsedUser = JSON.parse(storedUser);
//         let imgUrl = "/default_staff.png";

//         if (parsedUser?.image) {
//           imgUrl = parsedUser.image.includes("localhost:3000")
//             ? parsedUser.image.replace("localhost:3000", "localhost:3001")
//             : parsedUser.image;
//         }

//         setUserInfo({
//           name: parsedUser?.staffName || parsedUser?.name || "User",
//           image: imgUrl,
//         });
//       } catch (err) {
//         console.error("User data parse error:", err);
//         setUserInfo({ name: "Unknown User", image: "/default_staff.png" });
//       }
//     };

//     loadUserData();
//   }, []);

//   const handleLogout = () => {
//     Cookies.remove("access_token");
//     Cookies.remove("refresh_token");
//     localStorage.removeItem("user_data");
//     window.location.href = "/login";
//   };

//   return (
//     <header className={styles.topbar}>
//       <div className={styles.leftSection}>
//         <div className={styles.companyInfo}>
//           <div className={styles.logoIcon}>
//             <Image
//               src="/companylogo.jpeg"
//               alt="Company Logo"
//               width={40}
//               height={40}
//               style={{ objectFit: "cover" }}
//             />
//           </div>
//           <div className={styles.logobrand}>
//             MYANMAR BRILLIANCE <span>AUTO</span>
//           </div>
//         </div>
//       </div>
//       <div>
//         <nav className={styles.topNavigation}>
//           <Link href="/vehicle-driver-assign" className={styles.navLink}>
//             <FontAwesomeIcon icon={faIdCardClip} className={styles.navIcon} />
//             <span>Assignments</span>
//           </Link>
//           <Link href="/rental-op" className={styles.navLink}>
//             <FontAwesomeIcon icon={faTaxi} />
//             <span>Rental Operations</span>
//           </Link>
//         </nav>
//       </div>

//       <div className={styles.actions}>
//         <div className={styles.togglediv}>
//           <button className={styles.themeToggle} onClick={toggleTheme}>
//             <FontAwesomeIcon icon={isLight ? faMoon : faSun} />
//           </button>

//           <div className={styles.alertBtn}>
//             <FontAwesomeIcon icon={faBell} />
//             <span className={styles.badge}>1</span>
//           </div>
//         </div>

//         <div className={styles.userSection}>
//           <div className={styles.userProfile}>
//             <div className={styles.avatar}>
//               <Image
//                 src={userInfo.image}
//                 alt="staff"
//                 width={35}
//                 height={35}
//                 unoptimized
//               />
//             </div>
//             <span className={styles.userName}>{userInfo.name}</span>
//           </div>

//           <button
//             className={styles.logoutBtn}
//             onClick={handleLogout}
//             title="Logout"
//           >
//             <FontAwesomeIcon icon={faSignOutAlt} />
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

"use client";
import React, { useEffect, useState } from "react";
import styles from "./TopNav.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faBell,
  faSignOutAlt,
  faIdCardClip,
  faTaxi,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/app/core/providers/ThemeProvider";
import Cookies from "js-cookie";

export const TopNav = () => {
  const pathname = usePathname();
  const { isLight, toggleTheme } = useTheme();
  const [userInfo, setUserInfo] = useState({
    name: "Loading...",
    image: "/default_staff.png",
  });

  // Active link စစ်ဆေးသည့် logic
  const checkActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem("user_data");
      if (!storedUser || storedUser === "undefined") {
        setUserInfo({ name: "Unknown User", image: "/default_staff.png" });
        return;
      }
      try {
        const parsedUser = JSON.parse(storedUser);
        let imgUrl = "/default_staff.png";
        if (parsedUser?.image) {
          imgUrl = parsedUser.image.includes("localhost:3000")
            ? parsedUser.image.replace("localhost:3000", "localhost:3001")
            : parsedUser.image;
        }
        setUserInfo({
          name: parsedUser?.staffName || parsedUser?.name || "User",
          image: imgUrl,
        });
      } catch (err) {
        console.error("User data parse error:", err);
        setUserInfo({ name: "Unknown User", image: "/default_staff.png" });
      }
    };
    loadUserData();
  }, []);

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    localStorage.removeItem("user_data");
    window.location.href = "/login";
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.leftSection}>
        <div className={styles.companyInfo}>
          <div className={styles.logoIcon}>
            <Image
              src="/companylogo.jpeg"
              alt="Company Logo"
              width={40}
              height={40}
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className={styles.logobrand}>
            MYANMAR BRILLIANCE <span>AUTO</span>
          </div>
        </div>
      </div>

      <nav className={styles.topNavigation}>
        {/* Assignments Link */}
        <Link href="/vehicle-driver-assign" style={{ textDecoration: "none" }}>
          <div className={`${styles.navItem} ${checkActive("/vehicle-driver-assign") ? styles.active : ""}`}>
            <FontAwesomeIcon icon={faIdCardClip} className={styles.navIcon} />
            <span className={styles.navText}>Assignments</span>
          </div>
        </Link>

        {/* Rental Operations Link (Dropdown မဟုတ်ဘဲ Link အဖြစ်ပြောင်းလဲထားသည်) */}
        <Link href="/rental-op" style={{ textDecoration: "none" }}>
          <div className={`${styles.navItem} ${checkActive("/rental-op") ? styles.active : ""}`}>
            <FontAwesomeIcon icon={faTaxi} className={styles.navIcon} />
            <span className={styles.navText}>Rental Operations</span>
          </div>
        </Link>
      </nav>

      <div className={styles.actions}>
        <div className={styles.togglediv}>
          <button className={styles.themeToggle} onClick={toggleTheme}>
            <FontAwesomeIcon icon={isLight ? faMoon : faSun} />
          </button>
          <div className={styles.alertBtn}>
            <FontAwesomeIcon icon={faBell} />
            <span className={styles.badge}>1</span>
          </div>
        </div>

        <div className={styles.userSection}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              <Image src={userInfo.image} alt="staff" width={35} height={35} unoptimized />
            </div>
            <span className={styles.userName}>{userInfo.name}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </div>
    </header>
  );
};