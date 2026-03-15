"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { SummaryCard } from "../../features/dashboard/components/SummaryCard";
import { AlertsTable } from "../../features/dashboard/components/AlertsTable";
import {
  faCalendarAlt,
  faCar,
  faChartLine,
  faDotCircle,
  faLaptop,
  faTags,
} from "@fortawesome/free-solid-svg-icons";
import { PageHeader } from "../../components/ui/PageHeader/pageheader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// ၁။ သင်၏ api-client ကို Import လုပ်ပါ
import { apiClient } from "../../features/lib/api-client";

export default function DashboardPage() {
  const [apiStatus, setApiStatus] = useState<string>("Waiting for test...");
  const [staffCount, setStaffCount] = useState<number | string>("?");

  // ၂။ Token Expire စမ်းသပ်ရန် Function
  const fetchDashboardData = async () => {
    try {
      setApiStatus("Fetching data...");

      // Protected route တစ်ခုကို ခေါ်ယူခြင်း (Access Token လိုအပ်သော route)
      const response = await apiClient.get("/master-company/staff");
      console.log(response);

      setStaffCount(response.data.length || 0);
      setApiStatus("API Success: Data Loaded!");
      console.log("Dashboard Data:", response.data);
    } catch (error: any) {
      setApiStatus(
        `API Failed: ${error.response?.data?.message || error.message}`,
      );
      console.error("Dashboard API Error:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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

      {/* API Testing Status Box (စမ်းသပ်ရန်အတွက်သာ) */}
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
