"use client";

import React from "react";
import styles from "./Company.module.css";
import { PageHeader } from "../../components/ui/PageHeader/pageheader";
import { Button } from "../../components/ui/Button/Button";
import { Input } from "../../components/ui/Input/Input";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faPlus,
  faTrash,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";

const companies = [
  {
    id: 1,
    name: "Myanmar Brilliance Auto",
    email: "myanmarbrillianceauto@gmail.com",
    address: "No 22, Aung Myitt Thar road, Bago, Myanmar",
    website: "https://myanmarbrillianceauto.com",
    regNo: "10387373635",
    phone: "0974645555",
  },
];

export default function Company() {
  return (
    <div className={styles.container}>

      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faBuilding} />,
          text: "Company Management",
        }}
        actionNode={
          <Button
            icon={<FontAwesomeIcon icon={faPlus} />}
          >
            <Link href="/company/create">ADD COMPANY</Link>
          </Button>
        }
      />

      <div className={styles.contentGrid}>

        {/* TABLE SECTION */}
        <div className={styles.tableCard}>
          <div className={styles.tableTitle}>COMPANY MASTER RECORDS</div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Company Info</th>
                <th>Email</th>
                <th>Address</th>
                <th>Website</th>
                <th>Reg No</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td className={styles.companyCell}>
                    <div className={styles.companyLogo}></div>
                    <div>
                      <div className={styles.companyName}>{company.name}</div>
                    </div>
                  </td>

                  <td>{company.email}</td>
                  <td>{company.address}</td>
                  <td>{company.website}</td>
                  <td>{company.regNo}</td>
                  <td>{company.phone}</td>

                  <td>
                    <FontAwesomeIcon
                      icon={faTrash}
                      className={styles.deleteIcon}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.pagination}>
            Showing <span>1</span> to <span>10</span> of <span>200</span> total
            records
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.sidePanel}>

          <div className={styles.searchCard}>
            <h3>Company Search</h3>

            <Input label="Searching" placeholder="Searching Name, Email..." />

            <div className={styles.dateRow}>
              <Input label="From" type="date" />
              <Input label="To" type="date" />
            </div>

            <Button>Reset Filters</Button>
          </div>

          <div className={styles.recentCard}>
            <div className={styles.recentTitle}>
              <FontAwesomeIcon icon={faClockRotateLeft} />
              RECENT RECORD
            </div>

            <div className={styles.recordItem}>
              Total Company : <span>1</span>
            </div>

            <div className={styles.recordItem}>
              Active Company : <span className={styles.active}>1</span>
            </div>

            <div className={styles.recordItem}>
              Inactive Company : <span className={styles.inactive}>0</span>
            </div>

            <div className={styles.lastEdit}>
              Last Edited : <span>Nickey (Admin)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}