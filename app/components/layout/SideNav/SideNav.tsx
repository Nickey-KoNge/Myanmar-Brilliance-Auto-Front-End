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

const NavItem = ({
  icon,
  label,
  href,
}: {
  icon: IconDefinition;
  label: string;
  href: string;
}) => {
  const pathname = usePathname();
  // const isActive = pathname.startsWith(href);
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div className={`${styles.menuItem} ${isActive ? styles.active : ""}`}>
        <FontAwesomeIcon icon={icon} className={styles.icon} />
        <span className={styles.menuText}>{label}</span>
      </div>
    </Link>
  );
};

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

  const getActiveMenu = (path: string) => {
    if (path.match(/^\/(staff|customer|supplier|driver)/)) return "Personnel";
    if (path.match(/^\/(company|branch|station|groups)/)) return "Entity";
    if (path.match(/^\/(vehicle-brands|vehicle-models|vehicle)/))
      return "Fleet";
    if (path.match(/^\/(rental-operations)/)) return "Rental";
    if (path.match(/^\/audit/)) return "Audit";
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
        setClickedDropdown(null);
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
            // { icon: faUserTie, label: "Customer", href: "/customer" },
            // { icon: faTruckMoving, label: "Supplier", href: "/supplier" },
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
              href: "/vehicle-model",
            },
            {
              icon: faCarSide,
              label: "Vehicle",
              href: "/vehicle",
            },
            {
              icon: faIdCardClip,
              label: "Assignments",
              href: "/vehicle-driver-assign",
            },
          ]}
          isOpen={openDropdown === "Fleet"}
          onToggle={() => handleToggle("Fleet")}
          isHovered={isHovered}
        />
        {/* <NavItem icon={faWrench} label="Spare-part" href="/spare-part" /> */}

        {/* <div className={styles.sectionTitle}>
          <span className={styles.menuText}>Sale</span>
        </div>
        <NavItem icon={faShoppingCart} label="Sale" href="/sale" /> */}

        {/* <div className={styles.sectionTitle}>
          <span className={styles.menuText}>Purchase</span>
        </div>
        <NavItem icon={faFileInvoice} label="Purchase" href="/purchase" /> */}

        <div className={styles.sectionTitle}>
          <span className={styles.menuText}>Trip</span>
        </div>
        <NavItem icon={faRoute} label="Trip" href="/trip" />

        <div className={styles.sectionTitle}>
          <span className={styles.menuText}>Rental & Trip</span>
        </div>

        <NavDropdown
          icon={faKey}
          label="Rental"
          subItems={[
            {
              icon: faTaxi,
              label: "Rental Op",
              href: "/rental-op",
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
            // { icon: faIdCardClip, label: "Driver", href: "/driver" },
          ]}
          isOpen={openDropdown === "Audit"}
          onToggle={() => handleToggle("Audit")}
          isHovered={isHovered}
        />

        {/* <div className={styles.sectionTitle}>
          <span className={styles.menuText}>Cashflow</span>
        </div>
        <NavItem icon={faDollarSign} label="Cashflow" href="/cashflow" /> */}
      </div>
    </aside>
  );
};
