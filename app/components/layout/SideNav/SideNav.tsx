"use client";
import React from "react";
import styles from "./SideNav.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
} from "@fortawesome/free-solid-svg-icons";

export const SideNav = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        VEHICLE <span>ERP</span>
      </div>
      <div className={styles.menu}>
        <div className={`${styles.menuItem} ${styles.active}`}>
          <FontAwesomeIcon icon={faLaptop} className={styles.icon} />
          Dashboard
        </div>

        <div className={styles.sectionTitle}>Master Data</div>
        <NavItem icon={faUsers} label="Personnel" />
        <NavItem icon={faBuilding} label="Entity" />
        <NavItem icon={faWrench} label="Spare-part" />
        <NavItem icon={faCar} label="Fleet" />

        <div className={styles.sectionTitle}>Sale</div>
        <NavItem icon={faShoppingCart} label="Sale" />

        <div className={styles.sectionTitle}>Purchase</div>
        <NavItem icon={faFileInvoice} label="Purchase" />

        <div className={styles.sectionTitle}>Trip</div>
        <NavItem icon={faRoute} label="Trip" />

        <div className={styles.sectionTitle}>Rental & Trip</div>
        <NavItem icon={faKey} label="Rental" />

        <div className={styles.sectionTitle}>Cashflow</div>
        <NavItem icon={faDollarSign} label="Cashflow" />
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label }: { icon: any; label: string }) => (
  <div className={styles.menuItem}>
    <FontAwesomeIcon icon={icon} className={styles.icon} />
    {label}
    <FontAwesomeIcon icon={faChevronRight} className={styles.arrow} />
  </div>
);
