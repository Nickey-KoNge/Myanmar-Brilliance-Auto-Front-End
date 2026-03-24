// "use client";
// import React from "react";
// import styles from "./SideNav.module.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faLaptop,
//   faUsers,
//   faBuilding,
//   faWrench,
//   faCar,
//   faShoppingCart,
//   faFileInvoice,
//   faRoute,
//   faKey,
//   faDollarSign,
//   faChevronRight,
// } from "@fortawesome/free-solid-svg-icons";

// export const SideNav = () => {
//   return (
//     <aside className={styles.sidebar}>
//       <div className={styles.brand}>
//         VEHICLE <span>ERP</span>
//       </div>
//       <div className={styles.menu}>
//         <div className={`${styles.menuItem} ${styles.active}`}>
//           <FontAwesomeIcon icon={faLaptop} className={styles.icon} />
//           Dashboard
//         </div>

//         <div className={styles.sectionTitle}>Master Data</div>
//         <NavItem icon={faUsers} label="Personnel" />
//         <NavItem icon={faBuilding} label="Entity" />
//         <NavItem icon={faWrench} label="Spare-part" />
//         <NavItem icon={faCar} label="Fleet" />

//         <div className={styles.sectionTitle}>Sale</div>
//         <NavItem icon={faShoppingCart} label="Sale" />

//         <div className={styles.sectionTitle}>Purchase</div>
//         <NavItem icon={faFileInvoice} label="Purchase" />

//         <div className={styles.sectionTitle}>Trip</div>
//         <NavItem icon={faRoute} label="Trip" />

//         <div className={styles.sectionTitle}>Rental & Trip</div>
//         <NavItem icon={faKey} label="Rental" />

//         <div className={styles.sectionTitle}>Cashflow</div>
//         <NavItem icon={faDollarSign} label="Cashflow" />
//       </div>
//     </aside>
//   );
// };

// const NavItem = ({ icon, label }: { icon: any; label: string }) => (
//   <div className={styles.menuItem}>
//     <FontAwesomeIcon icon={icon} className={styles.icon} />
//     {label}
//     <FontAwesomeIcon icon={faChevronRight} className={styles.arrow} />
//   </div>
// );

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
  faWrench,
  faCar,
  faShoppingCart,
  faFileInvoice,
  faRoute,
  faKey,
  faDollarSign,
  faChevronRight,
  faChevronDown,
  faUser,
  faUserTie,
  faTruckMoving,
  faIdCardClip,
  faBuildingFlag,
  faCodeBranch,
  faChargingStation,
  faObjectGroup,
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
  const isActive = pathname.startsWith(href);

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div className={`${styles.menuItem} ${isActive ? styles.active : ""}`}>
        <FontAwesomeIcon icon={icon} className={styles.icon} />
        {label}
        <FontAwesomeIcon icon={faChevronRight} className={styles.arrow} />
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
}

const NavDropdown: React.FC<NavDropdownProps> = ({ icon, label, subItems }) => {
  const pathname = usePathname();

  const isAnyChildActive = subItems.some((item) =>
    pathname.startsWith(item.href),
  );

  const [isOpen, setIsOpen] = useState(isAnyChildActive);

  return (
    <div className={styles.navGroup}>
      <div className={styles.menuItem} onClick={() => setIsOpen(!isOpen)}>
        <FontAwesomeIcon icon={icon} className={styles.icon} />
        {label}
        <FontAwesomeIcon
          icon={isOpen ? faChevronDown : faChevronRight}
          className={styles.arrow}
        />
      </div>

      {/* Sub Items */}
      {isOpen && (
        <div className={styles.subMenu}>
          {subItems.map((item, index) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={index}
                href={item.href}
                style={{ textDecoration: "none" }}
              >
                <div
                  className={`${styles.subMenuItem} ${
                    isActive ? styles.subActive : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className={styles.subIcon}
                  />
                  {item.label}
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

  const isDashboardActive =
    pathname === "/" || pathname.startsWith("/dashboard");

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        VEHICLE <span>ERP</span>
      </div>
      <div className={styles.menu}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <div
            className={`${styles.menuItem} ${isDashboardActive ? styles.active : ""}`}
          >
            <FontAwesomeIcon icon={faLaptop} className={styles.icon} />
            Dashboard
          </div>
        </Link>

        <div className={styles.sectionTitle}>Inventory</div>

        <NavDropdown
          icon={faUsers}
          label="Personnel"
          subItems={[
            { icon: faUser, label: "Staff", href: "/staff" },
            { icon: faUserTie, label: "Customer", href: "/customer" },
            { icon: faTruckMoving, label: "Supplier", href: "/supplier" },
            { icon: faIdCardClip, label: "Driver", href: "/driver" },
          ]}
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
        />

        <NavItem icon={faWrench} label="Spare-part" href="/spare-part" />
        <NavItem icon={faCar} label="Fleet" href="/fleet" />

        <div className={styles.sectionTitle}>Sale</div>
        <NavItem icon={faShoppingCart} label="Sale" href="/sale" />

        <div className={styles.sectionTitle}>Purchase</div>
        <NavItem icon={faFileInvoice} label="Purchase" href="/purchase" />

        <div className={styles.sectionTitle}>Trip</div>
        <NavItem icon={faRoute} label="Trip" href="/trip" />

        <div className={styles.sectionTitle}>Rental & Trip</div>
        <NavItem icon={faKey} label="Rental" href="/rental" />

        <div className={styles.sectionTitle}>Cashflow</div>
        <NavItem icon={faDollarSign} label="Cashflow" href="/cashflow" />
      </div>
    </aside>
  );
};
