"use client";

import { useState, useMemo } from "react";
import { apiClient } from "@/app/features/lib/api-client";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import DateInput from "@/app/components/ui/Inputs/DateInput";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import styles from "../page.module.css";

// 🌟 Backend မှ ပြန်ပို့မည့် မူရင်း Data ပုံစံ
interface BackendVehicleLogRecord {
  trip_id?: string; // Backend တွင် trip_id ပါရှိပါသည်
  date: string;
  start_km: string | number;
  end_km: string | number;
  start_battery_percent: string | number;
  end_battery_percent: string | number;
  charging_amount: string | number;
  overnight_stay: string;
  remark: string;
}

// 🌟 DataTable တွင် အသုံးပြုရန် id ပါဝင်သော Frontend Data ပုံစံ
interface VehicleLogRecord extends BackendVehicleLogRecord {
  id: string | number; // DataTable အတွက် မဖြစ်မနေလိုအပ်ပါသည်
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
      const response = (await apiClient.get(
        `/reports/vehicle-log/${vehicleId}?startDate=${startDate}&endDate=${endDate}`,
      )) as VehicleLogResponse;

      // 🌟 Backend ကလာတဲ့ Data ထဲသို့ DataTable လိုချင်တဲ့ id ကို map ဖြင့် တွဲပေးခြင်း
      const dataWithIds: VehicleLogRecord[] = (response.logs || []).map(
        (item, index) => ({
          ...item,
          id: item.trip_id || `log-${index}`, // trip_id (သို့) index ကို id ထဲသို့ ထည့်ပေးပါသည်
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
                Generate Log
              </ActionBtn>
            </div>
          </div>
        </div>
      }
    >
      <div>
        <div className={styles.tableHeaderArea}>
          <p className={styles.tableTitle}>Vehicle Detailed Logs</p>
          {/* 🌟 Inline Style အစား CSS Class ကို ပြောင်းသုံးထားပါသည် */}
          <input
            type="text"
            placeholder="Search Remark..."
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
            emptyMessage="No log found."
          />
        )}
      </div>
    </PageGridLayout>
  );
}
