"use client";

import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillTrendUp,
  faBoltLightning,
  faWallet,
  faCalendarDays,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";

// Components
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import TextInput from "@/app/components/ui/Inputs/TextInput";
import DateInput from "@/app/components/ui/Inputs/DateInput";

// API & Hooks
import { apiClient } from "@/app/features/lib/api-client";
import { FilterState, useFilters } from "@/app/hooks/userFilters";
import styles from "../page.module.css";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";

// Strict Interfaces
interface FinancialBreakdownRecord {
  id: string;
  period_label: string;
  vehicle_plate: string;
  driver_name: string;
  total_income: number;
  charging_refund: number;
  net_profit: number;
}

interface ApiFinancialResponse {
  data?: {
    breakdown?: Omit<FinancialBreakdownRecord, "id">[];
  };
  breakdown?: Omit<FinancialBreakdownRecord, "id">[];
}

export default function CompanyFinancialReportPage() {
  const todayDate = new Date();
  const firstDayOfMonth = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];
  const todayStr = todayDate.toISOString().split("T")[0];

  // Data States
  const [records, setRecords] = useState<FinancialBreakdownRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Pagination & Stat States
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Active Filters State
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    search: "",
    driverName: "",
    vehiclePlate: "",
    startDate: "",
    endDate: "",
  });

  // Custom Hook for Filters
  const { filters, updateFilter, resetFilters } = useFilters(
    {
      search: "",
      driverName: "",
      vehiclePlate: "",
      startDate: "",
      endDate: "",
    },
    (debouncedFilters: FilterState) => {
      const isFilterChanged =
        activeFilters.driverName !== debouncedFilters.driverName ||
        activeFilters.vehiclePlate !== debouncedFilters.vehiclePlate ||
        activeFilters.startDate !== debouncedFilters.startDate ||
        activeFilters.endDate !== debouncedFilters.endDate ||
        activeFilters.search !== debouncedFilters.search;

      setActiveFilters(debouncedFilters);

      if (isFilterChanged) {
        setCurrentPage(1);
      }
    },
  );

  // Fetch API Data
  useEffect(() => {
    const fetchCompanyReport = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (activeFilters.startDate)
          queryParams.append("startDate", activeFilters.startDate as string);
        if (activeFilters.endDate)
          queryParams.append("endDate", activeFilters.endDate as string);
        if (activeFilters.vehiclePlate)
          queryParams.append(
            "vehiclePlate",
            activeFilters.vehiclePlate as string,
          );
        if (activeFilters.driverName)
          queryParams.append("driverName", activeFilters.driverName as string);

        const response = await apiClient.get(
          `/reports/company-financials?${queryParams.toString()}`,
        );

        // Strict Type Handling without `any`
        const res = response as unknown as ApiFinancialResponse;

        const rawBreakdown = res?.data?.breakdown || res?.breakdown || [];

        const dataWithIds: FinancialBreakdownRecord[] = rawBreakdown.map(
          (item, index) => ({
            ...item,
            id: `period-${index}`,
          }),
        );

        setRecords(dataWithIds);
      } catch (error: unknown) {
        console.error("Failed to fetch company financial report:", error);
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyReport();
  }, [activeFilters]);

  // Client-Side Search & Filtering
  const filteredRecords = useMemo(() => {
    const searchText = (activeFilters.search as string) || "";
    if (!searchText) return records;
    return records.filter(
      (row) =>
        row.period_label.toLowerCase().includes(searchText.toLowerCase()) ||
        row.vehicle_plate.toLowerCase().includes(searchText.toLowerCase()) ||
        row.driver_name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [records, activeFilters.search]);

  // Client-Side Pagination Calculations
  const totalRecords = filteredRecords.length;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE) || 1;
  const paginatedRecords = useMemo(() => {
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    return filteredRecords.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredRecords, currentPage]);

  // Stats Calculations
  const profitCount = filteredRecords.filter((r) => r.net_profit >= 0).length;
  const lossCount = filteredRecords.filter((r) => r.net_profit < 0).length;

  // 🌟 Dynamic Summary Calculation 🌟
  const dynamicSummary = useMemo(() => {
    let gross_income = 0;
    let total_charging_refund = 0;
    let total_net_profit = 0;

    filteredRecords.forEach((row) => {
      gross_income += row.total_income;
      total_charging_refund += row.charging_refund;
      total_net_profit += row.net_profit;
    });

    return {
      gross_income,
      total_charging_refund,
      total_net_profit,
    };
  }, [filteredRecords]);

  const columns = [
    {
      header: "Date",
      key: "period_label",
      render: (row: FinancialBreakdownRecord) => (
        <span className={styles.textBold}>{row.period_label}</span>
      ),
    },
    {
      header: "Vehicle Plate",
      key: "vehicle_plate",
      render: (row: FinancialBreakdownRecord) => (
        <span className={styles.textBold}>{row.vehicle_plate}</span>
      ),
    },
    {
      header: "Driver",
      key: "driver_name",
      render: (row: FinancialBreakdownRecord) => <span>{row.driver_name}</span>,
    },
    {
      header: "Total Income",
      key: "total_income",
      render: (row: FinancialBreakdownRecord) => (
        <span className={styles.textSuccess}>
          {row.total_income.toLocaleString()} Ks
        </span>
      ),
    },
    {
      header: "Refund (Charging)",
      key: "charging_refund",
      render: (row: FinancialBreakdownRecord) => (
        <span className={styles.textWarning}>
          {row.charging_refund.toLocaleString()} Ks
        </span>
      ),
    },
    {
      header: "Net Income",
      key: "net_profit",
      render: (row: FinancialBreakdownRecord) => {
        const isLoss = row.net_profit < 0;
        return (
          <span
            className={styles.badgeLabel}
            style={{
              color: isLoss ? "var(--danger)" : "var(--success)",
              border: `1px solid ${isLoss ? "var(--danger)" : "var(--success)"}`,
            }}
          >
            {row.net_profit.toLocaleString()} Ks
          </span>
        );
      },
    },
  ];

  return (
    <PageGridLayout
      sidebar={
        <div className={styles.sidebarWrapper}>
          <div className={styles.topSection}>
            <p className={styles.gridBoxTitle}>Financial Filters</p>
            <hr className={styles.cuttingLine} />

            <div className={styles.searchContainer}>
              <TextInput
                label="Search"
                placeholder="Search plate, driver..."
                value={filters.search as string}
                onChange={(e) => updateFilter("search", e.target.value)}
              />

              <TextInput
                label="Driver Name"
                placeholder="Filter by driver..."
                value={filters.driverName as string}
                onChange={(e) => updateFilter("driverName", e.target.value)}
              />

              <TextInput
                label="Vehicle Plate"
                placeholder="Filter by plate..."
                value={filters.vehiclePlate as string}
                onChange={(e) => updateFilter("vehiclePlate", e.target.value)}
              />

              <div className={styles.filterRow}>
                <DateInput
                  label="Start Date"
                  value={filters.startDate as string}
                  onChange={(e) => updateFilter("startDate", e.target.value)}
                  rightIcon={faCalendarDays}
                />
                <DateInput
                  label="End Date"
                  value={filters.endDate as string}
                  onChange={(e) => updateFilter("endDate", e.target.value)}
                  rightIcon={faCalendarDays}
                />
              </div>

              <ActionBtn
                type="reset"
                variant="action"
                fullWidth={true}
                onClick={resetFilters}
              >
                Reset
              </ActionBtn>
            </div>
          </div>

          <div className={styles.bottomSection}>
            <hr className={styles.cuttingLine} />

            <div className={styles.recentRecord}>
              <span>
                <FontAwesomeIcon icon={faClockRotateLeft} />
              </span>
              <p className={styles.recentTitle}>FINANCIAL STATS</p>
              <span />

              <div className={styles.stat}>
                <div>
                  <p className={styles.statLabel}>Total Records :</p>
                  <p className={styles.textInfo}>{totalRecords}</p>
                </div>
                <div>
                  <p className={styles.statLabel}>Profits :</p>
                  <p className={styles.textSuccess}>{profitCount}</p>
                </div>
                <div>
                  <p className={styles.statLabel}>Losses :</p>
                  <p className={styles.textDanger}>{lossCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className={styles.tableArea}>
        {/* ---- Summary Cards ---- */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <p className={styles.summaryCardLabel}>
              <FontAwesomeIcon
                icon={faMoneyBillTrendUp}
                style={{ marginRight: "6px" }}
              />
              Gross Income (ငှားခ + OT)
            </p>
            <h3 className={`${styles.summaryCardValue} ${styles.textSuccess}`}>
              {dynamicSummary.gross_income.toLocaleString()} Ks
            </h3>
          </div>

          <div className={styles.summaryCard}>
            <p className={styles.summaryCardLabel}>
              <FontAwesomeIcon
                icon={faBoltLightning}
                style={{ marginRight: "6px" }}
              />
              EV Charging Refund
            </p>
            <h3 className={`${styles.summaryCardValue} ${styles.textWarning}`}>
              - {dynamicSummary.total_charging_refund.toLocaleString()} Ks
            </h3>
          </div>

          <div className={styles.summaryCard}>
            <p className={styles.summaryCardLabel}>
              <FontAwesomeIcon icon={faWallet} style={{ marginRight: "6px" }} />
              Net Income (အသားတင် ရငွေ)
            </p>
            <h3
              className={styles.summaryCardValue}
              style={{
                color:
                  dynamicSummary.total_net_profit < 0
                    ? "var(--danger)"
                    : "var(--success)",
              }}
            >
              {dynamicSummary.total_net_profit.toLocaleString()} Ks
            </h3>
          </div>
        </div>

        {/* ---- Table Header Area ---- */}
        <div className={styles.tableArea}>
          <div className={styles.tableHeaderArea}>
            <div className={styles.paginationInfoWrapper}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
                showOnlyInfo={true}
              />
            </div>
            <p className={styles.tableTitle}>FINANCIAL P&L RECORDS</p>
          </div>

          {isLoading ? (
            <div className={styles.loadingText}>Fetching P&L Data...</div>
          ) : (
            <DataTable
              data={paginatedRecords}
              columns={columns}
              emptyMessage="No financial records found. Try adjusting the filters."
            />
          )}
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        showOnlyActions={true}
      />
    </PageGridLayout>
  );
}
