"use client";

import { useState, useMemo } from "react";
import { apiClient } from "@/app/features/lib/api-client";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import DateInput from "@/app/components/ui/Inputs/DateInput";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import styles from "../page.module.css";

// 🌟 Backend မှလာသော မူရင်း Data ပုံစံ
interface BackendTripDetail {
  trip_id: string;
  date: string;
  route: string;
  vehicle: string;
  distance_km: number;
  income_generated: number;
}

// 🌟 DataTable တွင်သုံးရန် 'id' ပါဝင်သော Frontend Data ပုံစံ
interface TripDetail extends BackendTripDetail {
  id: string | number; // DataTable အတွက် မဖြစ်မနေလိုအပ်ပါသည်
}

interface DriverSummary {
  total_trips_driven: number;
  total_distance_km: number;
  total_income_generated: number;
}

interface DriverReportResponse {
  summary: DriverSummary;
  trip_details: BackendTripDetail[];
}

export default function DriverReportPage() {
  const [driverId, setDriverId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [records, setRecords] = useState<TripDetail[]>([]);
  const [summary, setSummary] = useState<DriverSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");

  const fetchReport = async () => {
    if (!driverId) return alert("Please enter Driver ID");
    setIsLoading(true);
    try {
      const response = (await apiClient.get(
        `/reports/driver/${driverId}?startDate=${startDate}&endDate=${endDate}`,
      )) as DriverReportResponse;

      // 🌟 Backend ကလာတဲ့ trip_id ကို DataTable လိုချင်တဲ့ id အဖြစ် Map ဖြင့်တွဲပေးခြင်း
      const dataWithIds: TripDetail[] = (response.trip_details || []).map(
        (item, index) => ({
          ...item,
          id: item.trip_id || `trip-${index}`, // trip_id ကို id ထဲသို့ ထည့်ပေးပါသည်
        }),
      );

      setRecords(dataWithIds);
      setSummary(response.summary);
    } catch (error) {
      console.error("Failed to fetch driver report:", error);
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
        String(row.vehicle).toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [records, searchText]);

  const columns = [
    {
      header: "Date",
      key: "date",
      render: (row: TripDetail) => new Date(row.date).toLocaleDateString(),
    },
    { header: "Route", key: "route" },
    {
      header: "Vehicle Plate",
      key: "vehicle",
      render: (row: TripDetail) => (
        <span className={styles.textBold}>{row.vehicle}</span>
      ),
    },
    { header: "Distance (KM)", key: "distance_km" },
    {
      header: "Income Generated",
      key: "income_generated",
      render: (row: TripDetail) => (
        <span className={styles.textSuccess}>{row.income_generated} Ks</span>
      ),
    },
  ];

  return (
    <PageGridLayout
      sidebar={
        <div className={styles.sidebarWrapper}>
          <div className={styles.topSection}>
            <p className={styles.gridBoxTitle}>Driver Filter</p>
            <hr className={styles.cuttingLine} />
            <div className={styles.searchContainer}>
              {/* 🌟 Inline Style အစား CSS Class ကို ပြောင်းသုံးထားပါသည် */}
              <input
                type="text"
                placeholder="Enter Driver ID"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
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
                Generate
              </ActionBtn>
            </div>
          </div>

          {summary && (
            <div className={styles.bottomSection}>
              <hr className={styles.cuttingLine} />
              <p className={styles.recentTitle}>DRIVER SUMMARY</p>
              <div className={styles.stat}>
                <div>
                  <p className={styles.statLabel}>Total Trips:</p>
                  <p className={styles.textBold}>
                    {summary.total_trips_driven}
                  </p>
                </div>
                <div>
                  <p className={styles.statLabel}>Total Distance:</p>
                  <p className={styles.textBold}>
                    {summary.total_distance_km} KM
                  </p>
                </div>
                <div>
                  <p
                    className={styles.statLabel}
                    style={{ fontWeight: "bold" }}
                  >
                    Total Income:
                  </p>
                  {/* 🌟 Inline Style အစား totalAmount Class ကို ပြောင်းသုံးထားပါသည် */}
                  <p className={styles.totalAmount}>
                    {summary.total_income_generated.toLocaleString()} Ks
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
          <p className={styles.tableTitle}>Driver Performance</p>
          {/* 🌟 Inline Style အစား CSS Class ကို ပြောင်းသုံးထားပါသည် */}
          <input
            type="text"
            placeholder="Search Route, Plate..."
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
