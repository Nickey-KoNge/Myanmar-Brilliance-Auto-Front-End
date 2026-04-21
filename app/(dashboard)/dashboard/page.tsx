"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { SummaryCard } from "../../features/dashboard/components/SummaryCard";
import { AlertsTable } from "../../features/dashboard/components/AlertsTable";
import {
  faCalendarAlt,
  faCar,
  faCashRegister,
  faChartLine,
  faLaptop,
  faMoneyBill,
  faMoneyBills,
  faTags,
} from "@fortawesome/free-solid-svg-icons";
import { PageHeader } from "../../components/ui/PageHeader/pageheader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isAxiosError } from "axios";

import { apiClient } from "../../features/lib/api-client";
import ReactGoogleChart from "@/app/components/ui/Chart/Chart";

export default function DashboardPage() {
  const [apiStatus, setApiStatus] = useState<string>("Waiting for test...");
  const [staffCount, setStaffCount] = useState<number | string>("?");
  const [vehicles, setVehicles] = useState<any[]>([]);

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

  const rentalSaleData = [
    ["Month", "Rental", "Sales"],
    ["Jan", 40000, 15000],
    ["Feb", 45000, 22000],
    ["Mar", 38000, 18000],
    ["Apr", 50000, 25000],
    ["May", 52000, 27000],
    ["Jun", 61000, 30000],
    ["Jul", 58000, 28000],
    ["Aug", 64000, 32000],
    ["Sep", 70000, 35000],
    ["Oct", 68000, 33000],
    ["Nov", 75000, 40000],
    ["Dec", 82000, 45000],
  ];

  const rentalPerMonthData = [
    ["Month", "2026"],
    ["Jan", 40000],
    ["Feb", 45000],
    ["Mar", 38000],
    ["Apr", 50000],
    ["May", 52000],
    ["Jun", 61000],
    ["Jul", 58000],
    ["Aug", 64000],
    ["Sep", 70000],
    ["Oct", 68000],
    ["Nov", 75000],
    ["Dec", 82000],
  ];

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const vehiclesResponse = await apiClient.get(
          "http://localhost:3001/master-vehicle/vehicles",
        );

        const vehiclesData = vehiclesResponse.data;
        setVehicles(vehiclesData);
      } catch (error) {
      } finally {
      }
    };

    fetchChartData();
  }, []);

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v.status === "Active").length;
  const activePercentage =
    totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;

  const busyVehicles = vehicles.filter((v) => v.status === "Busy").length;
  const busyPercentage =
    totalVehicles > 0 ? (busyVehicles / totalVehicles) * 100 : 0;

  const maintenanceVehicles = vehicles.filter(
    (v) => v.status === "Maintenance",
  ).length;
  const maintenancePercentage =
    totalVehicles > 0 ? (maintenanceVehicles / totalVehicles) * 100 : 0;

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
          <ReactGoogleChart
            type="ColumnChart"
            data={rentalSaleData}
            title="CASHFLOW: RENTAL VS SALES"
            icon={faMoneyBill}
          />
        </div>

        <div className={styles.chartPlaceholder}>
          <ReactGoogleChart
            type="LineChart"
            data={rentalPerMonthData}
            title="CASHFLOW: RENTAL PER MONTH"
            icon={faMoneyBills}
          />
        </div>
      </div>

      <div className={styles.middleRow}>
        <div className={styles.chartPlaceholder}>
          <div className={styles.chartTitle}>
            <span className={styles.chartTitleText}>
              RENTAL VEHICLES DISTRIBUTION
            </span>
            <span className={styles.chartSubtitle}>Fleet Status</span>
          </div>
          <div className={styles.cardsContainer}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                CURRENTLY <br /> RENTED
              </div>
              <div className={styles.cardBody}>
                <FontAwesomeIcon icon={faCar} className={styles.cardIcon} />
                <span className={styles.cardValue}>{busyVehicles}</span>
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.statusBarOuter}>
                  <div
                    className={styles.statusBarInner}
                    style={{ width: `${busyPercentage.toFixed(2)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                AVAILABLE <br /> NOW
              </div>
              <div className={styles.cardBody}>
                <FontAwesomeIcon icon={faCar} className={styles.cardIcon} />
                <span className={styles.cardValue}>{activeVehicles}</span>
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.statusBarOuter}>
                  <div
                    className={styles.statusBarInner}
                    style={{ width: `${activePercentage.toFixed(2)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardHeader}>MAINTENANCE</div>
              <div className={styles.cardBody}>
                <FontAwesomeIcon icon={faCar} className={styles.cardIcon} />
                <span className={styles.cardValue}>{maintenanceVehicles}</span>
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.statusBarOuter}>
                  <div
                    className={styles.statusBarInner}
                    style={{ width: `${maintenancePercentage.toFixed(2)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AlertsTable />
      </div>
    </>
  );
}
