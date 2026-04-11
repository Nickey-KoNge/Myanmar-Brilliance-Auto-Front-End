"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { SummaryCard } from "../../features/dashboard/components/SummaryCard";
import { AlertsTable } from "../../features/dashboard/components/AlertsTable";
import {
  faCalendarAlt,
  faCar,
  faChartLine,
  faLaptop,
  faTags,
} from "@fortawesome/free-solid-svg-icons";
import { PageHeader } from "../../components/ui/PageHeader/pageheader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isAxiosError } from "axios";

import { apiClient } from "../../features/lib/api-client";

export default function DashboardPage() {
  const [apiStatus, setApiStatus] = useState<string>("Waiting for test...");
  const [staffCount, setStaffCount] = useState<number | string>("?");

  // ၂။ Token Expire စမ်းသပ်ရန် Function
  const fetchDashboardData = async () => {
    try {
      setApiStatus("Fetching data...");

      const response = await apiClient.get("/master-company/staff");
      const responseData = response.data.data || response.data;
      const totalStaff =
        response.data.total !== undefined
          ? response.data.total
          : responseData.length;

      console.log("Total Staff Loaded:", totalStaff);

      setStaffCount(totalStaff || 0);
      setApiStatus("API Success: Data Loaded!");
    } catch (error: unknown) {
      let errorMessage = "Unknown error occurred";

      if (isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setApiStatus(`API Failed: ${errorMessage}`);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDashboardData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);
  const renderLiveButtonArea = (
    <div className={styles.headerActionArea}>
      <button className={styles.calendarIconBtn} onClick={fetchDashboardData}>
        <FontAwesomeIcon icon={faCalendarAlt} className={styles.calendarIcon} />
      </button>

      <button className={styles.liveBtn}>ANALYTICAL LIVE</button>
    </div>
  );

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faLaptop} />,
          text: "Dashboard",
        }}
        actionNode={renderLiveButtonArea}
      />

      <div
        style={{
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "8px",
          backgroundColor: apiStatus.includes("Success")
            ? "#d4edda"
            : "#f8d7da",
          color: apiStatus.includes("Success") ? "#155724" : "#721c24",
          fontSize: "0.8rem",
          fontWeight: "bold",
        }}
      >
        Status: {apiStatus} | Total Staff: {staffCount}
      </div>

      <div className={styles.topRow}>
        <SummaryCard
          title="TOTAL RENTAL UNITS"
          value="125 Vehicles"
          subtitle="86% Utilization Rate"
          status="success"
          icon={faCar}
        />
        <SummaryCard
          title="RENTAL REVENUE"
          value="$ 429,333"
          subtitle="High Demand"
          status="danger"
          icon={faChartLine}
        />
        <SummaryCard
          title="SALES REVENUE"
          value="$ 158,483"
          subtitle="3 UNITS SOLD"
          status="neutral"
          icon={faTags}
        />
      </div>

      <div className={styles.middleRow}>
        <div className={styles.chartPlaceholder}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.9rem",
              marginBottom: "1rem",
            }}
          >
            CASHFLOW: RENTAL VS SALE
          </div>
        </div>
        <div className={styles.chartPlaceholder}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.9rem",
              marginBottom: "1rem",
            }}
          >
            CASHFLOW: RENTAL PER MONTH
          </div>
        </div>
      </div>

      <div className={styles.middleRow}>
        <div className={styles.chartPlaceholder}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
            RENTAL VEHICLE DISTRIBUTION
          </div>
        </div>
        <AlertsTable />
      </div>
    </>
  );
}
