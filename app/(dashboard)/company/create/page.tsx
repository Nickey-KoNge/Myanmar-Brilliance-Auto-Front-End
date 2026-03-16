"use client";

import React from "react";
import styles from "./CreateCompany.module.css";
import { PageHeader } from "../../../components/ui/PageHeader/pageheader";
import { Button } from "../../../components/ui/Button/Button";
import { Input } from "../../../components/ui/Input/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";

export default function CreateCompany() {
  return (
    <div className={styles.container}>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faBuilding} />,
          text: "Company Registration",
        }}
        actionNode={
            <div className={styles.actions}>
            <Button>Cancel</Button>
            <Button>Save Record</Button>
          </div>
        }
      />

      <div className={styles.grid}>

        {/* PROFESSIONAL ASSIGNMENT */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>PROFESSIONAL ASSIGNMENT</div>

          <Input label="Web Site URL" placeholder="Enter Company URL" />
          <Input label="Email" placeholder="example@gmail.com" />
        </div>

        {/* CORE IDENTITY */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>CORE IDENTITY ATTRIBUTES</div>

          <div className={styles.row}>
            <Input label="Company Name" placeholder="Enter Company Name" />
            <Input label="Company Registration No" placeholder="Enter Reg No" />
          </div>

          <div className={styles.row}>
            <Input label="Registration Expire" type="date" />
            <Input label="Establish Year" placeholder="2020" />
          </div>
        </div>

        {/* SECURITY */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>SECURITY & PHOTO</div>

          <div className={styles.uploadBox}>
            Upload Logo
          </div>
        </div>

        {/* CONTACT */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>CONTACT & ADDRESS DETAILS</div>

          <div className={styles.row}>
            <Input label="Phone Number" placeholder="+95 9 xxxx xxx" />
            <Input label="Country" placeholder="Myanmar" />
          </div>

          <Input label="City" placeholder="Yangon" />

          <textarea
            placeholder="Street Address"
            className={styles.textarea}
          />
        </div>

      </div>
    </div>
  );
}