"use client";

import { useState, useMemo } from "react";
import { apiClient } from "@/app/features/lib/api-client";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import DateInput from "@/app/components/ui/Inputs/DateInput";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import styles from "../page.module.css";

// 🌟 Backend မှ ပြန်ပို့မည့် မူရင်း Data ပုံစံ
interface BackendVehicleTripDetail {
  trip_id: string;
  date: string;
  route: string;
  driver: string;
  distance_km: number;
  charging_cost: number;
  income: number;
}

// 🌟 DataTable တွင် အသုံးပြုရန် id ပါဝင်သော Frontend Data ပုံစံ
interface VehicleTripDetail extends BackendVehicleTripDetail {
  id: string | number; // DataTable အတွက် မဖြစ်မနေလိုအပ်ပါသည်
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
      const response = (await apiClient.get(
        `/reports/vehicle/${vehicleId}?startDate=${startDate}&endDate=${endDate}`,
      )) as VehicleReportResponse;

      // 🌟 Backend ကလာတဲ့ trip_id ကို DataTable လိုချင်တဲ့ id အဖြစ် တွဲပေးခြင်း
      const dataWithIds: VehicleTripDetail[] = (
        response.trip_details || []
      ).map((item, index) => ({
        ...item,
        id: item.trip_id || `vehicle-trip-${index}`, // trip_id ကို id ထဲသို့ ထည့်ပေးပါသည်
      }));

      setRecords(dataWithIds);
      setSummary(response.summary);
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
              {/* 🌟 Inline Style အစား CSS Class ကို ပြောင်းသုံးထားပါသည် */}
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
              <ActionBtn
                variant="action"
                fullWidth
                onClick={fetchReport}
                style={{ marginTop: "10px" }}
              >
                Generate Report
              </ActionBtn>
            </div>
          </div>

          {summary && (
            <div className={styles.bottomSection}>
              <hr className={styles.cuttingLine} />
              <p className={styles.recentTitle}>VEHICLE SUMMARY</p>
              <div className={styles.stat}>
                <div>
                  <p className={styles.statLabel}>Total Trips:</p>
                  <p className={styles.textBold}>{summary.total_trips}</p>
                </div>
                <div>
                  <p className={styles.statLabel}>Gross Revenue:</p>
                  <p className={styles.textBold}>
                    {summary.financials.gross_revenue.toLocaleString()} Ks
                  </p>
                </div>
                <div>
                  <p className={styles.statLabel} style={{ fontWeight: "bold" }}>
                    Net Profit:
                  </p>
                  {/* 🌟 Inline Style အစား totalAmount Class ကို ပြောင်းသုံးထားပါသည် */}
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
          {/* 🌟 Inline Style အစား CSS Class ကို ပြောင်းသုံးထားပါသည် */}
          <input
            type="text"
            placeholder="Search Route, Driver..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={styles.tableSearchInput}
          />
        </div>

        {isLoading ? (
          // 🌟 Loading Text အတွက် CSS Class ကို ပြောင်းသုံးထားပါသည်
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