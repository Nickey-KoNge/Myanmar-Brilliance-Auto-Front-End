"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { SummaryCard } from "../../features/dashboard/components/SummaryCard";
import { AlertsTable } from "../../features/dashboard/components/AlertsTable";
import {
  faCar,
  faChartLine,
  faMoneyBill,
  faMoneyBills,
  faTags,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { apiClient } from "../../features/lib/api-client";
import ReactGoogleChart from "@/app/components/ui/Chart/Chart";

// 'any' အစားအသုံးပြုရန် Interface များ ကြေညာခြင်း
interface Vehicle {
  status: string;
  [key: string]: unknown; // အခြားအချက်အလက်များပါဝင်လာပါက လက်ခံနိုင်ရန်
}

interface FinanceRecord {
  total?: number | string;
  [key: string]: unknown;
}

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [rentalRevenue, setRentalRevenue] = useState<number>(0);

  const fetchChartData = async () => {
    try {
      const response = await apiClient.get("/master-vehicle/vehicles");
      const result = response.data;
      const vehicleList: Vehicle[] =
        result.data || (Array.isArray(result) ? result : []);
      const total =
        result.total !== undefined ? result.total : vehicleList.length;

      setVehicles(vehicleList);
      setTotalCount(total);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const response = await apiClient.get("master-rental/trip-finance");
      const financeData: FinanceRecord[] =
        response.data.data ||
        (Array.isArray(response.data) ? response.data : []);

      const totalSum = financeData.reduce(
        (acc: number, curr: FinanceRecord) => {
          return acc + Number(curr.total || 0);
        },
        0,
      );

      setRentalRevenue(totalSum);
    } catch (error) {
      console.error("Failed to fetch revenue:", error);
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      await Promise.all([fetchChartData(), fetchRevenueData()]);
    };
    initDashboard();
  }, []);

  const totalVehicles = totalCount;
  const activeVehicles = vehicles.filter((v) => v.status === "Active").length;
  const busyVehicles = vehicles.filter((v) => v.status === "Busy").length;
  const maintenanceVehicles = vehicles.filter(
    (v) => v.status === "Maintenance",
  ).length;

  const activePercentage =
    totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;
  const busyPercentage =
    totalVehicles > 0 ? (busyVehicles / totalVehicles) * 100 : 0;
  const maintenancePercentage =
    totalVehicles > 0 ? (maintenanceVehicles / totalVehicles) * 100 : 0;

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

  return (
    <>
      <div className={styles.topRow}>
        <SummaryCard
          title="TOTAL RENTAL UNITS"
          value={`${totalCount} Vehicles`}
          subtitle={`${activePercentage.toFixed(0)}% Utilization Rate`}
          status="success"
          icon={faCar}
        />
        <SummaryCard
          title="RENTAL REVENUE"
          value={`MMK ${rentalRevenue.toLocaleString()}`}
          subtitle="Real-time Revenue"
          status="danger"
          icon={faChartLine}
        />
        <SummaryCard
          title="SALES REVENUE"
          value="MMK 158,483"
          subtitle="3 UNITS SOLD"
          status="neutral"
          icon={faTags}
        />
        <SummaryCard
          title="SALES REVENUE"
          value="MMK 158,483"
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
              <div className={styles.cardHeader}>CURRENTLY RENTED</div>
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
              <div className={styles.cardHeader}>AVAILABLE NOW</div>
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
