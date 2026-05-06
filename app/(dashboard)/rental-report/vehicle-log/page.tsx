"use client";

import { useState, useMemo } from "react";
import { apiClient } from "@/app/features/lib/api-client";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import DateInput from "@/app/components/ui/Inputs/DateInput";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import styles from "../page.module.css";

interface BackendVehicleLogRecord {
  trip_id?: string;
  date: string;
  start_km: string | number;
  end_km: string | number;
  start_battery_percent: string | number;
  end_battery_percent: string | number;
  charging_amount: string | number;
  overnight_stay: string;
  remark: string;
}

interface VehicleLogRecord extends BackendVehicleLogRecord {
  id: string | number;
}

interface VehicleLogResponse {
  logs: BackendVehicleLogRecord[];
}

export default function VehicleLogPage() {
  const [vehicleId, setVehicleId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [records, setRecords] = useState<VehicleLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");

  const fetchReport = async () => {
    if (!vehicleId) return alert("Please enter Vehicle ID");
    setIsLoading(true);
    try {
      const response = await apiClient.get(
        `/reports/vehicle-log/${vehicleId}?startDate=${startDate}&endDate=${endDate}`,
      );
      const res = response as unknown as VehicleLogResponse;

      const dataWithIds: VehicleLogRecord[] = (res.logs || []).map(
        (item, index) => ({
          ...item,
          id: item.trip_id || `log-${index}`,
        }),
      );

      setRecords(dataWithIds);
    } catch (error) {
      console.error("Failed to fetch vehicle logs:", error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!searchText) return records;
    return records.filter(
      (row) =>
        String(row.remark).toLowerCase().includes(searchText.toLowerCase()) ||
        String(row.overnight_stay)
          .toLowerCase()
          .includes(searchText.toLowerCase()),
    );
  }, [records, searchText]);

  const columns = [
    { header: "Date", key: "date" },
    { header: "Start Odo", key: "start_km" },
    { header: "End Odo", key: "end_km" },
    {
      header: "Batt Start/End",
      key: "battery",
      render: (row: VehicleLogRecord) =>
        `${row.start_battery_percent}% - ${row.end_battery_percent}%`,
    },
    { header: "Charge Cost", key: "charging_amount" },
    { header: "Overnight", key: "overnight_stay" },
    { header: "Remark", key: "remark" },
  ];

  return (
    <PageGridLayout
      sidebar={
        <div className={styles.sidebarWrapper}>
          <div className={styles.topSection}>
            <p className={styles.gridBoxTitle}>Log Sheet Filter</p>
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
                  Generate Log
                </ActionBtn>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div>
        <div className={styles.tableHeaderArea}>
          <p className={styles.tableTitle}>Vehicle Detailed Logs</p>
          <input
            type="text"
            placeholder="Search Remark..."
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
            emptyMessage="No log found."
          />
        )}
      </div>
    </PageGridLayout>
  );
}
