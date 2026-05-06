"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChargingStation,
  faClock,
  faMoneyBill1Wave,
  faTags,
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
import ActionBtn from "@/app/components/ui/Button/ActionBtn";

// API & Hooks
import { apiClient } from "@/app/features/lib/api-client";
import { FilterState, useFilters } from "@/app/hooks/userFilters";
import styles from "./TripInvoicePage.module.css";

// Interfaces
interface TripListItem {
  id: string;
  date: string;
  route_name: string;
  driver_name: string;
  license_plate: string;
  trip_status: string;
  grand_total: number;
}

interface InvoiceDetail {
  id: string;
  report_generated_at: string;
  trip_summary: {
    route_name: string;
    trip_status: string;
    start_time: string;
    end_time: string;
    distance_km: string;
    duration_hours: string;
    extra_hours: string;
  };
  asset_summary: {
    license_plate: string;
    driver_name: string;
    station_branch: string;
  };
  ev_usage: {
    battery_usage: string;
    charging_station: string;
    kw_used: string;
    charging_cost: string;
  };
  finance_summary: {
    base_rental_fee: number;
    overtime_fee: number;
    refund_or_discount: number;
    charging_cost: number;
    grand_total_due: number;
    payment_status: string;
  };
}

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return isNaN(num)
    ? "0 Ks"
    : new Intl.NumberFormat("en-US").format(num) + " Ks";
};

export default function TripInvoicePage() {
  // Data States
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);

  // Pagination & Stat States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [completedTrips, setCompletedTrips] = useState(0);
  const [pendingTrips, setPendingTrips] = useState(0);
  const PAGE_SIZE = 10;

  // Modal & Loading States
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
    const fetchTripsList = async () => {
      try {
        const params: Record<string, string> = {
          page: currentPage.toString(),
          limit: PAGE_SIZE.toString(),
        };

        if (activeFilters.startDate)
          params.startDate = activeFilters.startDate as string;
        if (activeFilters.endDate)
          params.endDate = activeFilters.endDate as string;
        if (activeFilters.vehiclePlate)
          params.vehiclePlate = activeFilters.vehiclePlate as string;
        if (activeFilters.driverName)
          params.driverName = activeFilters.driverName as string;

        const queryString = new URLSearchParams(params).toString();
        const response = await apiClient.get(
          `/reports/customer-invoices?${queryString}`,
        );

        // Safely extract data from various possible API response structures
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res: any = response;
        let dataList: TripListItem[] = [];

        if (Array.isArray(res)) {
          // If response is a direct array: [ {...}, {...} ]
          dataList = res;
        } else if (res && res.data && Array.isArray(res.data)) {
          // If response is wrapped: { data: [ {...}, {...} ] }
          dataList = res.data;
        } else if (
          res &&
          res.data &&
          res.data.data &&
          Array.isArray(res.data.data)
        ) {
          // If response is deeply wrapped
          dataList = res.data.data;
        }

        // Calculate stats and pagination safely
        const total = res?.total || res?.data?.total || dataList.length;
        const totalPagesCount =
          res?.totalPages ||
          res?.data?.totalPages ||
          Math.ceil(total / PAGE_SIZE);

        const cCount =
          res?.completedCount ||
          res?.data?.completedCount ||
          dataList.filter((t) => t.trip_status === "Completed").length;
        const pCount =
          res?.pendingCount ||
          res?.data?.pendingCount ||
          dataList.filter((t) => t.trip_status !== "Completed").length;

        setTrips(dataList);
        setTotalRecords(total);
        setTotalPages(totalPagesCount || 1);
        setCompletedTrips(cCount);
        setPendingTrips(pCount);
      } catch (error) {
        console.error("Failed to fetch trips:", error);
        setTrips([]);
      }
    };

    fetchTripsList();
  }, [currentPage, activeFilters]);

  const handleViewInvoice = async (tripId: string) => {
    setIsModalOpen(true);
    setIsLoadingDetail(true);
    setInvoice(null);
    try {
      const response = await apiClient.get(
        `/reports/customer-invoice/${tripId}`,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resData: any = response;
      const detailData = resData?.data || resData;

      setInvoice(detailData);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      alert("Failed to load invoice details.");
      setIsModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setInvoice(null);
  };

  // Table Columns Setup
  const columns = [
    {
      header: "Date",
      key: "date",
      render: (trip: TripListItem) => (
        <div className={styles.textSmall}>
          {trip.date ? new Date(trip.date).toLocaleDateString() : "-"}
        </div>
      ),
    },
    {
      header: "Route",
      key: "route",
      render: (trip: TripListItem) => (
        <div className={styles.textBold}>{trip.route_name}</div>
      ),
    },
    {
      header: "Driver & Vehicle",
      key: "driver_vehicle",
      render: (trip: TripListItem) => (
        <div>
          <div className={styles.textBold}>{trip.driver_name}</div>
          <div className={[styles.textSmall, styles.textMuted].join(" ")}>
            {trip.license_plate}
          </div>
        </div>
      ),
    },
    {
      header: "Revenue",
      key: "revenue",
      render: (trip: TripListItem) => (
        <div className={styles.textSuccess}>
          <strong>{formatCurrency(trip.grand_total)}</strong>
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (trip: TripListItem) => {
        const isCompleted = trip.trip_status === "Completed";
        return (
          <span
            className={isCompleted ? styles.badgeSuccess : styles.badgeWarning}
          >
            {trip.trip_status}
          </span>
        );
      },
    },
    {
      header: "Action",
      key: "actions",
      render: (trip: TripListItem) => (
        <button
          className={styles.actionBtn}
          onClick={(e) => {
            e.stopPropagation();
            handleViewInvoice(trip.id);
          }}
        >
          View Detail
        </button>
      ),
    },
  ];

  return (
    <>
      <PageGridLayout
        sidebar={
          <div className={styles.sidebarWrapper}>
            <div className={styles.topSection}>
              <p className={styles.gridBoxTitle}>Invoice Filters</p>
              <hr className={styles.cuttingLine} />

              <div className={styles.searchContainer}>
                <TextInput
                  label="Driver Name"
                  placeholder="Search by driver..."
                  value={filters.driverName as string}
                  onChange={(e) => updateFilter("driverName", e.target.value)}
                />

                <TextInput
                  label="Vehicle Plate"
                  placeholder="Search by plate..."
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
                <p className={styles.recentTitle}>RECENT RECORD</p>
                <span />

                <div className={styles.stat}>
                  <div>
                    <p className={styles.statLabel}>Total Trips :</p>
                    <p className={styles.textInfo}>{totalRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Completed :</p>
                    <p className={styles.textSuccess}>{completedTrips}</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Other Status :</p>
                    <p className={styles.textWarning}>{pendingTrips}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        {/* Main Content Area (Table & Pagination) */}
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
            <p className={styles.tableTitle}>TRIP INVOICE RECORDS</p>
          </div>

          <DataTable
            data={trips}
            columns={columns}
            onRowClick={(trip) => handleViewInvoice(trip.id)}
          />
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

      {/* Invoice Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Invoice Receipt</h3>
              <button onClick={closeModal} className={styles.iconCloseBtn}>
                &times;
              </button>
            </div>

            <div className={styles.modalBody}>
              {isLoadingDetail ? (
                <div className={styles.loadingText}>
                  Loading invoice details...
                </div>
              ) : invoice ? (
                <div id="invoice-print-area">
                  <div className={styles.invHeaderRow}>
                    <div>
                      <h1 className={styles.invBrandName}>EV RENTAL SERVICE</h1>
                      <p className={styles.invMetaLabel}>
                        Official Trip Summary & Receipt
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className={styles.invMetaValue}>
                        INV-{invoice.id.substring(0, 8).toUpperCase()}
                      </p>
                      <p className={styles.invMetaLabel}>
                        Status:{" "}
                        <strong
                          className={
                            invoice.trip_summary.trip_status === "Completed"
                              ? styles.textSuccess
                              : styles.textWarning
                          }
                        >
                          {invoice.trip_summary.trip_status}
                        </strong>
                      </p>
                      <p className={styles.invMetaLabel}>
                        Generated:{" "}
                        {new Date(
                          invoice.report_generated_at,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className={styles.gridTwoCol}>
                    <div className={styles.infoPanel}>
                      <h4 className={styles.panelTitle}>Trip Information</h4>
                      <div className={styles.infoGrid}>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Route Name :</span>
                          <span className={styles.infoValue}>
                            {invoice.trip_summary.route_name}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Start Time :</span>
                          <span className={styles.infoValue}>
                            {new Date(
                              invoice.trip_summary.start_time,
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>End Time :</span>
                          <span className={styles.infoValue}>
                            {new Date(
                              invoice.trip_summary.end_time,
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>
                            Total Duration :
                          </span>
                          <span className={styles.infoHighlight}>
                            {invoice.trip_summary.duration_hours}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Extra Hr :</span>
                          <span className={styles.infoHighlight}>
                            {invoice.trip_summary.extra_hours}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Distance :</span>
                          <span
                            className={styles.infoValue}
                            style={{ fontWeight: "bold" }}
                          >
                            {invoice.trip_summary.distance_km} KM
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoPanel}>
                      <h4 className={styles.panelTitle}>Asset & Driver</h4>
                      <div className={styles.infoGrid}>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>
                            Driver Name :
                          </span>
                          <span className={styles.infoValue}>
                            {invoice.asset_summary.driver_name}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>
                            License Plate :
                          </span>
                          <span className={styles.plateBadge}>
                            {invoice.asset_summary.license_plate}
                          </span>
                        </div>
                        <div
                          className={styles.infoRow}
                          style={{ marginTop: "8px" }}
                        >
                          <span className={styles.infoLabel}>
                            Station Branch :
                          </span>
                          <span className={styles.infoValue}>
                            {invoice.asset_summary.station_branch}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "32px" }}>
                    <h4
                      className={styles.panelTitle}
                      style={{ border: "none" }}
                    >
                      EV Charging Info
                    </h4>
                    <table className={styles.simpleTable}>
                      <thead>
                        <tr>
                          <th>Charging Station</th>
                          <th>Battery Usage</th>
                          <th>KW Consumed</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{invoice.ev_usage.charging_station || "-"}</td>
                          <td>{invoice.ev_usage.battery_usage}</td>
                          <td>{invoice.ev_usage.kw_used}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.summaryAlignRight}>
                    <div className={styles.summaryBox}>
                      <h4 className={styles.panelTitle}>
                        Financial Overview (
                        {invoice.finance_summary.payment_status})
                      </h4>

                      <div className={styles.infoGrid}>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>
                            <FontAwesomeIcon
                              icon={faMoneyBill1Wave}
                              className={styles.cardIcon}
                            />{" "}
                            Base Rental:
                          </span>
                          <span className={styles.infoValue}>
                            {formatCurrency(
                              invoice.finance_summary.base_rental_fee,
                            )}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>
                            <FontAwesomeIcon
                              icon={faClock}
                              className={styles.cardIcon}
                            />{" "}
                            Overtime Fee:
                          </span>
                          <span className={styles.infoValue}>
                            {formatCurrency(
                              invoice.finance_summary.overtime_fee,
                            )}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>
                            <FontAwesomeIcon
                              icon={faChargingStation}
                              className={styles.cardIcon}
                            />{" "}
                            Charging Cost:
                          </span>
                          <span className={styles.infoValue}>
                            {formatCurrency(
                              invoice.finance_summary.charging_cost,
                            )}
                          </span>
                        </div>
                        <div
                          className={styles.infoRow}
                          style={{ marginBottom: "8px" }}
                        >
                          <span className={styles.textDanger}>
                            <FontAwesomeIcon
                              icon={faTags}
                              className={styles.cardIcon}
                            />{" "}
                            Refund:
                          </span>
                          <span className={styles.textDanger}>
                            -{" "}
                            {formatCurrency(
                              invoice.finance_summary.refund_or_discount,
                            )}
                          </span>
                        </div>
                      </div>

                      <div className={styles.grandTotalRow}>
                        <span className={styles.grandTotalLabel}>
                          <FontAwesomeIcon icon={faWallet} /> Grand Total
                        </span>
                        <span className={styles.grandTotalValue}>
                          {formatCurrency(
                            invoice.finance_summary.grand_total_due,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className={styles.modalFooter}>
              <button onClick={closeModal} className={styles.cancelBtn}>
                Close
              </button>
              <button
                onClick={() => window.print()}
                className={styles.printBtn}
                disabled={!invoice}
              >
                🖨 Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
