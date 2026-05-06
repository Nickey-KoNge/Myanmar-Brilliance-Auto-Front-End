"use client";

import { useState, useMemo } from "react";
import { apiClient } from "@/app/features/lib/api-client";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import DateInput from "@/app/components/ui/Inputs/DateInput";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import styles from "../page.module.css";

interface BackendVehicleTripDetail {
  trip_id: string;
  date: string;
  route: string;
  driver: string;
  distance_km: number;
  charging_cost: number;
  income: number;
}

interface VehicleTripDetail extends BackendVehicleTripDetail {
  id: string | number;
}

interface VehicleFinancials {
  gross_revenue: number;
  net_profit: number;
}

interface VehicleSummary {
  total_trips: number;
  financials: VehicleFinancials;
}

interface VehicleReportResponse {
  summary: VehicleSummary;
  trip_details: BackendVehicleTripDetail[];
}

export default function VehicleReportPage() {
  const [vehicleId, setVehicleId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [records, setRecords] = useState<VehicleTripDetail[]>([]);
  const [summary, setSummary] = useState<VehicleSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");

  const fetchReport = async () => {
    if (!vehicleId) return alert("Please enter Vehicle ID");
    setIsLoading(true);
    try {
      const response = await apiClient.get(
        `/reports/vehicle/${vehicleId}?startDate=${startDate}&endDate=${endDate}`,
      );
      const res = response as unknown as VehicleReportResponse;

      const dataWithIds: VehicleTripDetail[] = (res.trip_details || []).map(
        (item, index) => ({
          ...item,
          id: item.trip_id || `vehicle-trip-${index}`,
        }),
      );

      setRecords(dataWithIds);
      setSummary(res.summary);
    } catch (error) {
      console.error("Failed to fetch vehicle report:", error);
      setRecords([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!searchText) return records;
    return records.filter(
      (row) =>
        String(row.route).toLowerCase().includes(searchText.toLowerCase()) ||
        String(row.driver).toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [records, searchText]);

  const columns = [
    {
      header: "Date",
      key: "date",
      render: (row: VehicleTripDetail) =>
        new Date(row.date).toLocaleDateString(),
    },
    { header: "Route", key: "route" },
    { header: "Driver", key: "driver" },
    { header: "Dist (KM)", key: "distance_km" },
    {
      header: "Charging Cost",
      key: "charging_cost",
      render: (row: VehicleTripDetail) => (
        <span className={styles.textDanger}>{row.charging_cost} Ks</span>
      ),
    },
    {
      header: "Income",
      key: "income",
      render: (row: VehicleTripDetail) => (
        <span className={styles.textSuccess}>{row.income} Ks</span>
      ),
    },
  ];

  return (
    <PageGridLayout
      sidebar={
        <div className={styles.sidebarWrapper}>
          <div className={styles.topSection}>
            <p className={styles.gridBoxTitle}>Vehicle Filter</p>
            <hr className={styles.cuttingLine} />
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Enter Vehicle ID"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className={styles.searchInput}
              />
              <DateInput
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <DateInput
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <div className={styles.btnMarginTop}>
                <ActionBtn variant="action" fullWidth onClick={fetchReport}>
                  Generate Report
                </ActionBtn>
              </div>
            </div>
          </div>

          {summary && (
            <div className={styles.bottomSection}>
              <hr className={styles.cuttingLine} />
              <p className={styles.recentTitle}>VEHICLE SUMMARY</p>
              <div className={styles.stat}>
                <div className={styles.statRow}>
                  <p className={styles.statLabel}>Total Trips:</p>
                  <p className={styles.textBold}>{summary.total_trips}</p>
                </div>
                <div className={styles.statRow}>
                  <p className={styles.statLabel}>Gross Revenue:</p>
                  <p className={styles.textBold}>
                    {summary.financials.gross_revenue.toLocaleString()} Ks
                  </p>
                </div>
                <div className={styles.statRow}>
                  <p
                    className={styles.statLabel}
                    style={{ fontWeight: "bold" }}
                  >
                    Net Profit:
                  </p>
                  <p className={styles.totalAmount}>
                    {summary.financials.net_profit.toLocaleString()} Ks
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      }
    >
      <div>
        <div className={styles.tableHeaderArea}>
          <p className={styles.tableTitle}>Vehicle Performance</p>
          <input
            type="text"
            placeholder="Search Route, Driver..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={styles.tableSearchInput}
          />
        </div>

        {isLoading ? (
          <div className={styles.loadingText}>Loading...</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredRecords}
            emptyMessage="No data found."
          />
        )}
      </div>
    </PageGridLayout>
  );
}
