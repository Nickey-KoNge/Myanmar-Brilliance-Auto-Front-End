// "use client";
// import React, { useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import styles from "./SideNav.module.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
// import {
//   faLaptop,
//   faUsers,
//   faBuilding,
//   faCar,
//   faRoute,
//   faKey,
//   faChevronRight,
//   faChevronDown,
//   faUser,
//   faIdCardClip,
//   faBuildingFlag,
//   faCodeBranch,
//   faChargingStation,
//   faObjectGroup,
//   faTruckFast,
//   faClipboardList,
//   faGauge,
//   faTableList,
//   faLayerGroup,
//   faCarSide,
//   faAward,
//   faTaxi,
// } from "@fortawesome/free-solid-svg-icons";

// interface SubItem {
//   icon: IconDefinition;
//   label: string;
//   href: string;
// }

// interface NavDropdownProps {
//   icon: IconDefinition;
//   label: string;
//   subItems: SubItem[];
//   isOpen: boolean;
//   onToggle: () => void;
//   isHovered: boolean;
// }

// const NavDropdown: React.FC<NavDropdownProps> = ({
//   icon,
//   label,
//   subItems,
//   isOpen,
//   onToggle,
//   isHovered,
// }) => {
//   const pathname = usePathname();

//   const shouldShowSubMenu = isHovered && isOpen;

//   return (
//     <div className={styles.navGroup}>
//       <div className={styles.menuItem} onClick={onToggle}>
//         <FontAwesomeIcon icon={icon} className={styles.icon} />
//         <span className={styles.menuText}>{label}</span>
//         {isHovered && (
//           <FontAwesomeIcon
//             icon={shouldShowSubMenu ? faChevronDown : faChevronRight}
//             className={styles.arrow}
//           />
//         )}
//       </div>

//       {shouldShowSubMenu && (
//         <div className={styles.subMenu}>
//           {subItems.map((item, index) => {
//             const isActive =
//               item.href === "/audit"
//                 ? pathname === "/audit"
//                 : pathname === item.href ||
//                   pathname.startsWith(`${item.href}/`);

//             return (
//               <Link
//                 key={index}
//                 href={item.href}
//                 style={{ textDecoration: "none" }}
//               >
//                 <div
//                   className={`${styles.subMenuItem} ${isActive ? styles.subActive : ""}`}
//                 >
//                   <FontAwesomeIcon
//                     icon={item.icon}
//                     className={styles.subIcon}
//                   />
//                   <span className={styles.menuText}>{item.label}</span>
//                 </div>
//               </Link>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export const SideNav = () => {
//   const pathname = usePathname();
//   const [isHovered, setIsHovered] = useState(false);

//   const getActiveMenu = (path: string) => {
//     if (path.match(/^\/(staff|customer|supplier|driver)/)) return "Personnel";
//     if (path.match(/^\/(company|branch|station|groups)/)) return "Entity";
//     if (path.match(/^\/(vehicle-brands|vehicle-models|vehicle)/))
//       return "Fleet";
//     if (path.match(/^\/(rental-operations)/)) return "Rental";
//     if (path.match(/^\/audit/)) return "Audit";
//   };

//   const [clickedDropdown, setClickedDropdown] = useState<string | null>(null);

//   const currentActiveMenu = getActiveMenu(pathname);

//   const openDropdown =
//     clickedDropdown !== null ? clickedDropdown : currentActiveMenu;

//   const isDashboardActive =
//     pathname === "/" || pathname.startsWith("/dashboard");

//   const handleToggle = (dropdownName: string) => {
//     if (isHovered) {
//       setClickedDropdown(openDropdown === dropdownName ? "" : dropdownName);
//     }
//   };

//   return (
//     <aside
//       className={styles.sidebar}
//       onMouseEnter={() => {
//         setIsHovered(true);
//         setClickedDropdown(null);
//       }}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div className={styles.brand}>
//         <FontAwesomeIcon icon={faTruckFast} className={styles.brandIcon} />
//         <span className={styles.menuText}>
//           VEHICLE <span>ERP</span>
//         </span>
//       </div>
//       <div className={styles.menu}>
//         <Link href="/dashboard" style={{ textDecoration: "none" }}>
//           <div
//             className={`${styles.menuItem} ${isDashboardActive ? styles.active : ""}`}
//           >
//             <FontAwesomeIcon icon={faLaptop} className={styles.icon} />
//             <span className={styles.menuText}>Dashboard</span>
//           </div>
//         </Link>

//         <div className={styles.sectionTitle}>
//           <span className={styles.menuText}>Inventory / Master Data</span>
//         </div>

//         <NavDropdown
//           icon={faUsers}
//           label="Personnel"
//           subItems={[
//             { icon: faUser, label: "Staff", href: "/staff" },
//             // { icon: faUserTie, label: "Customer", href: "/customer" },
//             // { icon: faTruckMoving, label: "Supplier", href: "/supplier" },
//             { icon: faIdCardClip, label: "Driver", href: "/driver" },
//           ]}
//           isOpen={openDropdown === "Personnel"}
//           onToggle={() => handleToggle("Personnel")}
//           isHovered={isHovered}
//         />

//         <NavDropdown
//           icon={faBuilding}
//           label="Entity"
//           subItems={[
//             { icon: faBuildingFlag, label: "Company", href: "/company" },
//             { icon: faCodeBranch, label: "Branch", href: "/branch" },
//             { icon: faChargingStation, label: "Station", href: "/station" },
//             { icon: faObjectGroup, label: "Groups", href: "/groups" },
//           ]}
//           isOpen={openDropdown === "Entity"}
//           onToggle={() => handleToggle("Entity")}
//           isHovered={isHovered}
//         />
//         <NavDropdown
//           icon={faCar}
//           label="Fleet"
//           subItems={[
//             {
//               icon: faAward,
//               label: "Vehicle Brands",
//               href: "/vehicle-brands",
//             },
//             {
//               icon: faLayerGroup,
//               label: "Vehicle Models",
//               href: "/vehicle-model",
//             },
//             {
//               icon: faCarSide,
//               label: "Vehicle",
//               href: "/vehicle",
//             },
//           ]}
//           isOpen={openDropdown === "Fleet"}
//           onToggle={() => handleToggle("Fleet")}
//           isHovered={isHovered}
//         />
//         {/* <NavItem icon={faWrench} label="Spare-part" href="/spare-part" /> */}

//         {/* <div className={styles.sectionTitle}>
//           <span className={styles.menuText}>Sale</span>
//         </div>
//         <NavItem icon={faShoppingCart} label="Sale" href="/sale" /> */}

//         {/* <div className={styles.sectionTitle}>
//           <span className={styles.menuText}>Purchase</span>
//         </div>
//         <NavItem icon={faFileInvoice} label="Purchase" href="/purchase" /> */}

//         {/* <div className={styles.sectionTitle}>
//           <span className={styles.menuText}>Trip</span>
//         </div> */}

//         <NavDropdown
//           icon={faRoute}
//           label="Trip"
//           subItems={[
//             { icon: faRoute, label: "Trip Routes", href: "/trip-routes" },
//             {icon: faTableList, label: "Trip List", href: "/trip-prices" },
//             {
//               icon: faCar,
//               label: "Drivers Assignment",
//               href: "/vehicle-driver-assign/vehicle-driver-list",
//             },
//             { icon: faKey, label: "Rental Operations", href: "/rental-op/rental-op-list" },
//           ]}
//           isOpen={openDropdown === "Trip"}
//           onToggle={() => handleToggle("Trip")}
//           isHovered={isHovered}
//         />
//         {/* <NavItem icon={faRoute} label="Trip" href="/trip" /> */}

//         <div className={styles.sectionTitle}>
//           <span className={styles.menuText}>Rental & Trip</span>
//         </div>

//         <div className={styles.sectionTitle}>
//           <span className={styles.menuText}>Audit</span>
//         </div>
//         <NavDropdown
//           icon={faClipboardList}
//           label="Audit"
//           subItems={[
//             { icon: faGauge, label: "Dashboard", href: "/audit/dashboard" },
//             { icon: faTableList, label: "Audit List", href: "/audit" },
//             // { icon: faIdCardClip, label: "Driver", href: "/driver" },
//           ]}
//           isOpen={openDropdown === "Audit"}
//           onToggle={() => handleToggle("Audit")}
//           isHovered={isHovered}
//         />

//         {/* <div className={styles.sectionTitle}>
//           <span className={styles.menuText}>Cashflow</span>
//         </div>
//         <NavItem icon={faDollarSign} label="Cashflow" href="/cashflow" /> */}
//       </div>
//     </aside>
//   );
// };

"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SideNav.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faLaptop,
  faUsers,
  faBuilding,
  faCar,
  faRoute,
  faKey,
  faChevronRight,
  faChevronDown,
  faUser,
  faIdCardClip,
  faBuildingFlag,
  faCodeBranch,
  faChargingStation,
  faObjectGroup,
  faTruckFast,
  faClipboardList,
  faGauge,
  faTableList,
  faLayerGroup,
  faCarSide,
  faAward,
  faTaxi,
} from "@fortawesome/free-solid-svg-icons";

interface SubItem {
  icon: IconDefinition;
  label: string;
  href: string;
}

interface NavDropdownProps {
  icon: IconDefinition;
  label: string;
  subItems: SubItem[];
  isOpen: boolean;
  onToggle: () => void;
  isHovered: boolean;
}

const NavDropdown: React.FC<NavDropdownProps> = ({
  icon,
  label,
  subItems,
  isOpen,
  onToggle,
  isHovered,
}) => {
  const pathname = usePathname();

  const shouldShowSubMenu = isHovered && isOpen;

  return (
    <div className={styles.navGroup}>
      <div className={styles.menuItem} onClick={onToggle}>
        <FontAwesomeIcon icon={icon} className={styles.icon} />
        <span className={styles.menuText}>{label}</span>
        {isHovered && (
          <FontAwesomeIcon
            icon={shouldShowSubMenu ? faChevronDown : faChevronRight}
            className={styles.arrow}
          />
        )}
      </div>

      {shouldShowSubMenu && (
        <div className={styles.subMenu}>
          {subItems.map((item, index) => {
            const isActive =
              item.href === "/audit"
                ? pathname === "/audit"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={index}
                href={item.href}
                style={{ textDecoration: "none" }}
              >
                <div
                  className={`${styles.subMenuItem} ${isActive ? styles.subActive : ""}`}
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className={styles.subIcon}
                  />
                  <span className={styles.menuText}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const SideNav = () => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // ပြဿနာဖြစ်နေတဲ့ Active Menu ရှာတဲ့ နေရာကို သေချာအောင် ပြင်ထားပါတယ်
  const getActiveMenu = (path: string) => {
    if (path.match(/^\/(staff|customer|supplier|driver)/)) return "Personnel";
    if (path.match(/^\/(company|branch|station|groups)/)) return "Entity";

    // (/vehicle-driver-assign) ကို မငြိအောင် (\/|$) နဲ့ တိတိကျကျ သတ်မှတ်လိုက်ပါတယ်
    if (path.match(/^\/(vehicle-brands|vehicle-models|vehicle)(\/|$)/))
      return "Fleet";

    // Trip နဲ့ Rental အတွက် အသစ်ထည့်ထားပါတယ်
    if (path.match(/^\/(trip-routes|trip-prices)/)) return "Trip";
    if (path.match(/^\/(vehicle-driver-assign|rental-op)/)) return "Rental";

    if (path.match(/^\/audit/)) return "Audit";
    return null;
  };

  const [clickedDropdown, setClickedDropdown] = useState<string | null>(null);

  const currentActiveMenu = getActiveMenu(pathname);

  const openDropdown =
    clickedDropdown !== null ? clickedDropdown : currentActiveMenu;

  const isDashboardActive =
    pathname === "/" || pathname.startsWith("/dashboard");

  const handleToggle = (dropdownName: string) => {
    if (isHovered) {
      setClickedDropdown(openDropdown === dropdownName ? "" : dropdownName);
    }
  };

  return (
    <aside
      className={styles.sidebar}
      onMouseEnter={() => {
        setIsHovered(true);
        // Sidebar ပေါ် Mouse တင်လိုက်တိုင်း ဖွင့်ထားတာတွေ Reset မဖြစ်သွားအောင် ပြင်ထားပါတယ်
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.brand}>
        <FontAwesomeIcon icon={faTruckFast} className={styles.brandIcon} />
        <span className={styles.menuText}>
          VEHICLE <span>ERP</span>
        </span>
      </div>
      <div className={styles.menu}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <div
            className={`${styles.menuItem} ${isDashboardActive ? styles.active : ""}`}
          >
            <FontAwesomeIcon icon={faLaptop} className={styles.icon} />
            <span className={styles.menuText}>Dashboard</span>
          </div>
        </Link>

        <div className={styles.sectionTitle}>
          <span className={styles.menuText}>Inventory / Master Data</span>
        </div>

        <NavDropdown
          icon={faUsers}
          label="Personnel"
          subItems={[
            { icon: faUser, label: "Staff", href: "/staff" },
            { icon: faIdCardClip, label: "Driver", href: "/driver" },
          ]}
          isOpen={openDropdown === "Personnel"}
          onToggle={() => handleToggle("Personnel")}
          isHovered={isHovered}
        />

        <NavDropdown
          icon={faBuilding}
          label="Entity"
          subItems={[
            { icon: faBuildingFlag, label: "Company", href: "/company" },
            { icon: faCodeBranch, label: "Branch", href: "/branch" },
            { icon: faChargingStation, label: "Station", href: "/station" },
            { icon: faObjectGroup, label: "Groups", href: "/groups" },
          ]}
          isOpen={openDropdown === "Entity"}
          onToggle={() => handleToggle("Entity")}
          isHovered={isHovered}
        />

        <NavDropdown
          icon={faCar}
          label="Fleet"
          subItems={[
            {
              icon: faAward,
              label: "Vehicle Brands",
              href: "/vehicle-brands",
            },
            {
              icon: faLayerGroup,
              label: "Vehicle Models",
              href: "/vehicle-model", // Directory နာမည်နဲ့ ကိုက်ညီမှုရှိမရှိ ပြန်စစ်ပါ (/vehicle-models လား /vehicle-model လား)
            },
            {
              icon: faCarSide,
              label: "Vehicle",
              href: "/vehicle",
            },
          ]}
          isOpen={openDropdown === "Fleet"}
          onToggle={() => handleToggle("Fleet")}
          isHovered={isHovered}
        />

        <NavDropdown
          icon={faRoute}
          label="Trip"
          subItems={[
            { icon: faRoute, label: "Trip Routes", href: "/trip-routes" },
            { icon: faTableList, label: "Trip List", href: "/trip-prices" },
          ]}
          isOpen={openDropdown === "Trip"}
          onToggle={() => handleToggle("Trip")}
          isHovered={isHovered}
        />

        {/* နာမည်ပြောင်းပြီး အောက်ကို ရွှေ့ထားတဲ့ Rental Operations အပိုင်း */}
        <div className={styles.sectionTitle}>
          <span className={styles.menuText}>Rental Operations</span>
        </div>

        <NavDropdown
          icon={faTaxi} // faTaxi icon လေးသုံးပေးထားပါတယ်
          label="Rental"
          subItems={[
            {
              icon: faCar,
              label: "Drivers Assignment",
              href: "/vehicle-driver-assign/vehicle-driver-list",
            },
            {
              icon: faKey,
              label: "Rental Operations",
              href: "/rental-op/rental-op-list",
            },
          ]}
          isOpen={openDropdown === "Rental"}
          onToggle={() => handleToggle("Rental")}
          isHovered={isHovered}
        />

        <div className={styles.sectionTitle}>
          <span className={styles.menuText}>Audit</span>
        </div>

        <NavDropdown
          icon={faClipboardList}
          label="Audit"
          subItems={[
            { icon: faGauge, label: "Dashboard", href: "/audit/dashboard" },
            { icon: faTableList, label: "Audit List", href: "/audit" },
          ]}
          isOpen={openDropdown === "Audit"}
          onToggle={() => handleToggle("Audit")}
          isHovered={isHovered}
        />
      </div>
    </aside>
  );
};
