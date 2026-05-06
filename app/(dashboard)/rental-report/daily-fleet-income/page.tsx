"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/app/features/lib/api-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faChartLine,
  faFileInvoiceDollar,
  faCarSide,
} from "@fortawesome/free-solid-svg-icons";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import styles from "../page.module.css";
import DateInput from "@/app/components/ui/Inputs/DateInput";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";

interface FleetIncomeRecord {
  id: string | number;
  no: number;
  plate_number: string;
  owner_fee: number;
  remark: string;
}

interface FleetIncomeResponse {
  report_type: string;
  date: string;
  total_vehicles_operated: number;
  grand_total_income: number;
  details: FleetIncomeRecord[];
}

export default function DailyFleetIncomePage() {
  const [records, setRecords] = useState<FleetIncomeRecord[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalVehicles, setTotalVehicles] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [fetchDate, setFetchDate] = useState<string>(today);

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(
          `/reports/daily-fleet-income?date=${fetchDate}`,
        );
        const res = response as unknown as FleetIncomeResponse;
        const dataWithIds = (res.details || []).map((item, index) => ({
          ...item,
          id: item.plate_number + index.toString(),
        }));

        setRecords(dataWithIds);
        setTotalIncome(res.grand_total_income || 0);
        setTotalVehicles(res.total_vehicles_operated || 0);
      } catch (error) {
        console.error("Failed to fetch daily fleet income:", error);
        setRecords([]);
        setTotalIncome(0);
        setTotalVehicles(0);
      } finally {
        setIsLoading(false);
      }
    };

    if (fetchDate) {
      fetchReportData();
    }
  }, [fetchDate]);

  const handleGenerateReport = () => {
    setFetchDate(selectedDate);
  };

  const handleReset = () => {
    setSelectedDate(today);
    setFetchDate(today);
  };

  const columns = [
    {
      header: "No.",
      key: "no",
      render: (row: FleetIncomeRecord) => (
        <div className={styles.textBold} style={{ width: "40px" }}>
          {row.no}
        </div>
      ),
    },
    {
      header: "Plate Number",
      key: "plate_number",
      render: (row: FleetIncomeRecord) => (
        <div className={styles.info}>
          <div className={styles.defaultImage}>
            <FontAwesomeIcon icon={faCarSide} />
          </div>
          <div className={styles.textBold}>{row.plate_number}</div>
        </div>
      ),
    },
    {
      header: "Owner Fee (MMK)",
      key: "owner_fee",
      render: (row: FleetIncomeRecord) => (
        <div className={`${styles.textBold} ${styles.textSuccess}`}>
          {Number(row.owner_fee).toLocaleString()} Ks
        </div>
      ),
    },
    {
      header: "Remark",
      key: "remark",
      render: (row: FleetIncomeRecord) => (
        <div className={`${styles.textSmall} ${styles.textMuted}`}>
          {row.remark || "-"}
        </div>
      ),
    },
  ];

  return (
    <PageGridLayout
      sidebar={
        <div className={styles.sidebarWrapper}>
          <div className={styles.topSection}>
            <p className={styles.gridBoxTitle}>Report Filters</p>
            <hr className={styles.cuttingLine} />
            <div className={styles.searchContainer}>
              <DateInput
                label="Select Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                rightIcon={faCalendarDays}
              />
              <div className={styles.filterRow}>
                <ActionBtn
                  variant="action"
                  fullWidth={true}
                  onClick={handleGenerateReport}
                >
                  Generate
                </ActionBtn>
                <ActionBtn
                  variant="cancel"
                  fullWidth={true}
                  onClick={handleReset}
                >
                  Reset
                </ActionBtn>
              </div>
            </div>
          </div>

          <div className={styles.bottomSection}>
            <hr className={styles.cuttingLine} />
            <div className={styles.recentRecord}>
              <div className={styles.recentRecordIcon}>
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <div>
                <p className={styles.recentTitle}>FINANCIAL SUMMARY</p>
                <div className={styles.stat}>
                  <div className={styles.statRow}>
                    <p className={styles.statLabel}>Target Date :</p>
                    <p className={styles.textBold}>{fetchDate}</p>
                  </div>
                  <div className={styles.statRow}>
                    <p className={styles.statLabel}>Total Vehicles :</p>
                    <p className={styles.textSuccess}>{totalVehicles} Units</p>
                  </div>
                  <div
                    className={styles.statRow}
                    style={{ marginTop: "0.5rem" }}
                  >
                    <p
                      className={styles.statLabel}
                      style={{ fontWeight: "bold" }}
                    >
                      Grand Total :
                    </p>
                    <p
                      className={`${styles.textBold} ${styles.textSuccess}`}
                      style={{ fontSize: "1.1rem" }}
                    >
                      {totalIncome.toLocaleString()} Ks
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <hr className={styles.cuttingLine} />
          </div>
        </div>
      }
    >
      <div>
        <div className={styles.tableHeaderArea}>
          <p className={styles.tableTitle}>
            DAILY FLEET INCOME REPORT ( {fetchDate} )
          </p>
          <div className={styles.headerActionArea}>
            <ActionBtn
              variant="action"
              fullWidth={false}
              onClick={() => window.print()}
            >
              <FontAwesomeIcon
                icon={faFileInvoiceDollar}
                style={{ marginRight: "8px" }}
              />
              Print Report
            </ActionBtn>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingText}>Loading Report...</div>
        ) : (
          <DataTable
            columns={columns}
            data={records}
            emptyMessage="No trips completed on this date."
          />
        )}
      </div>
    </PageGridLayout>
  );
}
