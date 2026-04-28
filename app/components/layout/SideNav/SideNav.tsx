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
  faCarOn,
  faReorder,
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
    if (path.match(/^\/(company|branch|station|groups)/)) return "Company";

    if (path.match(/^\/(vehicle-brands|vehicle-models|vehicle)(\/|$)/))
      return "Vehicle";

    // Trip နဲ့ Rental အတွက် အသစ်ထည့်ထားပါတယ်
    if (path.match(/^\/(trip-routes|trip-prices)/)) return "Trip";
    if (path.match(/^\/(vehicle-driver-assign|rental-op)/)) return "Rental";
    if (path.match(/^\/(customer-invoice|daily-fleet-income | driver | vehicle | vehicle-log )/))
      return "rental-report";
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
          label="Company"
          subItems={[
            { icon: faBuildingFlag, label: "Company", href: "/company" },
            { icon: faCodeBranch, label: "Branch", href: "/branch" },
            { icon: faChargingStation, label: "Station", href: "/station" },
            { icon: faObjectGroup, label: "Groups", href: "/groups" },
          ]}
          isOpen={openDropdown === "Company"}
          onToggle={() => handleToggle("Company")}
          isHovered={isHovered}
        />

        <NavDropdown
          icon={faCar}
          label="Vehicle"
          subItems={[
            {
              icon: faAward,
              label: "Vehicle Brands",
              href: "/vehicle-brands",
            },
            {
              icon: faLayerGroup,
              label: "Vehicle Models",
              href: "/vehicle-model",
            },
            {
              icon: faCarSide,
              label: "Vehicle",
              href: "/vehicle",
            },
          ]}
          isOpen={openDropdown === "Vehicle"}
          onToggle={() => handleToggle("Vehicle")}
          isHovered={isHovered}
        />

        <NavDropdown
          icon={faRoute}
          label="Trip"
          subItems={[
            { icon: faRoute, label: "Routes", href: "/trip-routes" },
            { icon: faTableList, label: "Trip", href: "/trip-prices" },
          ]}
          isOpen={openDropdown === "Trip"}
          onToggle={() => handleToggle("Trip")}
          isHovered={isHovered}
        />

        <div className={styles.sectionTitle}>
          <span className={styles.menuText}>Rental Operations</span>
        </div>

        <NavDropdown
          icon={faCarOn} // faTaxi icon လေးသုံးပေးထားပါတယ်
          label="Rental"
          subItems={[
            {
              icon: faCar,
              label: "Assignment",
              href: "/vehicle-driver-assign/vehicle-driver-list",
            },
            {
              icon: faKey,
              label: "Operations",
              href: "/rental-op/rental-op-list",
            },
          ]}
          isOpen={openDropdown === "Rental"}
          onToggle={() => handleToggle("Rental")}
          isHovered={isHovered}
        />

        <div className={styles.sectionTitle}>
          <span className={styles.menuText}>Rental Report</span>
        </div>
        <NavDropdown
          icon={faReorder} // faTaxi icon လေးသုံးပေးထားပါတယ်
          label="Rental"
          subItems={[
            {
              icon: faCar,
              label: "customer-invoice",
              href: "/rental-report/customer-invoice",
            },
            {
              icon: faKey,
              label: "daily-income",
              href: "/rental-report/daily-fleet-income",
            },

            {
              icon: faKey,
              label: "driver",
              href: "/rental-report/driver",
            },
            {
              icon: faKey,
              label: "vehicle",
              href: "/rental-report/vehicle",
            },
             {
              icon: faKey,
              label: "vehicle-log",
              href: "/rental-report/vehicle-log",
            }
          ]}
          isOpen={openDropdown === "rental-report"}
          onToggle={() => handleToggle("rental-report")}
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
