"use client";

import React, { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faRotateLeft,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

import { apiClient } from "@/app/features/lib/api-client";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import TextInput from "@/app/components/ui/Inputs/TextInput";
import DateInput from "@/app/components/ui/Inputs/DateInput";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import { FilterState, useFilters } from "@/app/hooks/userFilters";

import styles from "./page.module.css";

interface AuditLog {
  id: string;
  created_at: string;
  performed_by: string;
  action: string;
  entity_name: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
}

export default function AuditLogPage() {
  const [auditData, setAuditData] = useState<AuditLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const getAllRecords = async () => {
      const response = await apiClient.get("/master-audit/all");
      setLogs(response.data || response);
    };

    getAllRecords();
  }, []);

  const PAGE_SIZE = 6;

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    search: "",
    startDate: "",
    endDate: "",
    entityName: "",
  });

  const { filters, updateFilter, resetFilters } = useFilters(
    { search: "", startDate: "", endDate: "", entityName: "" },
    (debouncedFilters: FilterState) => {
      const isFilterChanged =
        activeFilters.search !== debouncedFilters.search ||
        activeFilters.startDate !== debouncedFilters.startDate ||
        activeFilters.endDate !== debouncedFilters.endDate ||
        activeFilters.entityName !== debouncedFilters.entityName;

      setActiveFilters(debouncedFilters);

      if (isFilterChanged) {
        setCurrentPage(1);
      }
    },
  );

  const fetchAuditData = async () => {
    try {
      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: PAGE_SIZE.toString(),
      };

      if (activeFilters.search) params.search = String(activeFilters.search);
      if (activeFilters.startDate)
        params.startDate = String(activeFilters.startDate);
      if (activeFilters.endDate) params.endDate = String(activeFilters.endDate);
      if (activeFilters.entityName)
        params.entity_name = String(activeFilters.entityName);

      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/master-audit?${queryString}`);

      const res = response as unknown as {
        data?:
          | AuditLog[]
          | { data?: AuditLog[]; total?: number; totalPages?: number };
        total?: number;
        totalPages?: number;
      };

      let logList: AuditLog[] = [];
      let total = 0;
      let totalPagesCount = 1;

      if (res && typeof res === "object") {
        if (Array.isArray(res.data)) {
          logList = res.data;
          total = res.total || 0;
          totalPagesCount = res.totalPages || 1;
        } else if (
          res.data &&
          typeof res.data === "object" &&
          Array.isArray(res.data.data)
        ) {
          logList = res.data.data;
          total = res.data.total || 0;
          totalPagesCount = res.data.totalPages || 1;
        }
      }

      setAuditData(logList);
      setTotalRecords(total);
      setTotalPages(totalPagesCount);
    } catch (error) {
      console.error("Failed to fetch audits:", error);
      setAuditData([]);
    }
  };

  useEffect(() => {
    fetchAuditData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeFilters]);

  // Restore Function
  const handleRestore = async (auditId: string, entityName: string) => {
    if (!window.confirm("Are you sure you want to restore this data?")) return;

    try {
      let url = "";
      if (entityName === "branches") {
        url = `/master-company/branches/restore/${auditId}`;
      } else if (entityName === "company") {
        url = `/master-company/company/restore/${auditId}`;
      } else if (entityName === "driver") {
        url = `/master-company/driver/restore/${auditId}`;
      } else if (entityName === "staff") {
        url = `/master-company/staff/restore/${auditId}`;
      } else if (entityName === "stations") {
        url = `/master-company/stations/restore/${auditId}`;
      } else if (entityName === "groups") {
        url = `/master-company/groups/restore/${auditId}`;
      } else if (entityName === "vehicle") {
        url = `/master-vehicle/vehicles/restore/${auditId}`;
      } else if (entityName === "vehicle_models") {
        url = `/master-vehicle/vehicle-models/restore/${auditId}`;
      } else if (entityName === "vehicle_brands") {
        url = `/master-vehicle/vehicle-brands/restore/${auditId}`;
      } else if (entityName === "rental_operation") {
        url = `/master-rental/rental-operation/restore/${auditId}`;
      } else if(entityName === "routes"){
        url = `/master-trips/routes/restore/${auditId}`;
      } else if (entityName === "trip_prices") {
        url = `/master-trips/trip-prices/restore/${auditId}`;
      } else {
        toast.error("Restore not supported for this module yet.");
        return;
      }

      await apiClient.post(url);
      toast.success("Data restored successfully!");
      fetchAuditData();
    } catch (error) {
      console.error("Restore error:", error);
      toast.error("Failed to restore data.");
    }
  };
  const formatValue = (val: unknown) => {
    if (val === null || val === undefined || val === "") return "-";

    if (typeof val === "object") {
      if (Array.isArray(val)) {
        return val.length > 0
          ? val
              .map((v) =>
                typeof v === "object" ? JSON.stringify(v) : String(v),
              )
              .join(", ")
          : "-";
      }

      const obj = val as Record<string, unknown>;
      const displayName =
        (obj.company_name as string) ||
        (obj.name as string) ||
        (obj.branches_name as string);
      return displayName ? String(displayName) : JSON.stringify(obj);
    }

    return String(val);
  };
  // DataTable Columns Setup
  const columns = [
    {
      header: "User & Date",
      key: "user_info",
      render: (item: AuditLog) => (
        <div className={styles.userInfoCell}>
          <span className={styles.userName}>{item.performed_by}</span>
          <span className={styles.dateText}>
            {new Date(item.created_at).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      header: "Action",
      key: "action",
      render: (item: AuditLog) => {
        let badgeClass = styles.badgeCreate;
        if (item.action === "UPDATE") badgeClass = styles.badgeUpdate;
        if (item.action === "DELETE") badgeClass = styles.badgeDelete;
        if (item.action === "RESTORE") badgeClass = styles.badgeRestore;

        return (
          <span className={`${styles.badge} ${badgeClass}`}>{item.action}</span>
        );
      },
    },
    {
      header: "Record Type",
      key: "entity_name",
      render: (item: AuditLog) => (
        <strong style={{ textTransform: "capitalize" }}>
          {item.entity_name}
        </strong>
      ),
    },
    {
      header: "Before Change",
      key: "olddata",
      render: (item: AuditLog) => {
        let parsedOld = item.old_values;
        if (typeof parsedOld === "string") {
          try {
            parsedOld = JSON.parse(parsedOld);
          } catch {}
        }
        const hasOldData = parsedOld && Object.keys(parsedOld).length > 0;

        return (
          <div className={`${styles.changesCell} ${styles.dataColumn}`}>
            {item.action === "RESTORE" && !hasOldData ? (
              <span
                style={{
                  color: "#9ca3af",
                  fontStyle: "italic",
                  fontSize: "0.875rem",
                }}
              >
                Deleted / Previous State
              </span>
            ) : (
              hasOldData && (
                <div className={styles.oldValue}>
                  {Object.entries(parsedOld as Record<string, unknown>).map(
                    ([key, value]) => {
                      if (key === "deleted_at" || key === "updated_at")
                        return null;
                      return (
                        <div key={key} className={styles.dataRow}>
                          <span className={styles.dataKey}>
                            <b>
                              {key
                                .split("_")
                                .map(
                                  (w) => w.charAt(0).toUpperCase() + w.slice(1),
                                )
                                .join(" ")}{" "}
                              :{" "}
                            </b>
                          </span>

                          <span className={styles.dataVal}>
                            {formatValue(value)}
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              )
            )}
          </div>
        );
      },
    },
    {
      header: "After Change",
      key: "newdata",
      render: (item: AuditLog) => {
        let parsedNew = item.new_values;
        if (typeof parsedNew === "string") {
          try {
            parsedNew = JSON.parse(parsedNew);
          } catch {}
        }
        const hasNewData = parsedNew && Object.keys(parsedNew).length > 0;

        return (
          <div className={`${styles.changesCell} ${styles.dataColumn}`}>
            {item.action === "RESTORE" && !hasNewData ? (
              <span
                style={{
                  color: "#059669",
                  fontWeight: 500,
                  fontStyle: "italic",
                  fontSize: "0.875rem",
                }}
              >
                Successfully Restored
              </span>
            ) : (
              hasNewData && (
                <div className={styles.newValue}>
                  {item.action === "RESTORE" && (
                    <div
                      style={{
                        color: "#059669",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        marginBottom: "4px",
                        borderBottom: "1px solid #a7f3d0",
                        paddingBottom: "2px",
                      }}
                    >
                      ✅ Restored Data:
                    </div>
                  )}
                  {Object.entries(parsedNew as Record<string, unknown>).map(
                    ([key, value]) => {
                      if (key === "deleted_at" || key === "updated_at")
                        return null;
                      return (
                        <div key={key} className={styles.dataRow}>
                          <span className={styles.dataKey}>
                            <b>
                              {key
                                .split("_")
                                .map(
                                  (w) => w.charAt(0).toUpperCase() + w.slice(1),
                                )
                                .join(" ")}{" "}
                              :{" "}
                            </b>
                          </span>

                          <span className={styles.dataVal}>
                            {formatValue(value)}
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              )
            )}
          </div>
        );
      },
    },
    {
      header: "Actions",
      key: "actions",
      render: (item: AuditLog) =>
        (item.action === "UPDATE" || item.action === "DELETE") && (
          <button
            className={styles.restoreBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleRestore(item.id, item.entity_name);
            }}
            title="Restore Data"
          >
            <FontAwesomeIcon icon={faRotateLeft} /> Restore
          </button>
        ),
    },
  ];

  return (
    <PageGridLayout
      sidebar={
        <div className={styles.sidebarWrapper}>
          <div className={styles.topSection}>
            <p className={styles.gridBoxTitle}>Audit Log Filters</p>
            <hr className={styles.cuttingLine} />

            <div className={styles.searchContainer}>
              <TextInput
                label="Global Search"
                placeholder="Search user, action, type..."
                value={String(filters.search || "")}
                onChange={(e) => updateFilter("search", e.target.value)}
              />

              <TextInput
                label="Record Type (e.g. branches)"
                placeholder="Search Record Type..."
                value={String(filters.entityName || "")}
                onChange={(e) => updateFilter("entityName", e.target.value)}
              />

              <div className={styles.filterRow}>
                <DateInput
                  label="From Date"
                  value={String(filters.startDate || "")}
                  onChange={(e) => updateFilter("startDate", e.target.value)}
                  rightIcon={faCalendarDays}
                />
                <DateInput
                  label="To Date"
                  value={String(filters.endDate || "")}
                  onChange={(e) => updateFilter("endDate", e.target.value)}
                  rightIcon={faCalendarDays}
                />
              </div>

              <ActionBtn
                type="reset"
                variant="action"
                fullWidth={false}
                onClick={resetFilters}
              >
                Reset
              </ActionBtn>
            </div>
          </div>

          <div className={styles.bottomSection}>
            <hr className={styles.cuttingLine} />
            {/* <div className={styles.recentRecord}>
              <span>
                <FontAwesomeIcon
                  icon={faShieldHalved}
                  style={{ color: "#fff" }}
                />
              </span>
              <p className={styles.recentTitle}>SECURITY STATS</p>
              <span />
              <div className={styles.stat}>
                <div>
                  <p className={styles.statLable}>Total Logs :</p>
                  <p className={styles.textMain}>{totalRecords}</p>
                </div>
              </div>
            </div> */}

            <div className={styles.recentRecord}>
              <span>
                <FontAwesomeIcon icon={faShieldHalved} />
              </span>
              <p className={styles.recentTitle}>SECURITY STATS</p>
              <span />

              <div className={styles.stat}>
                <div>
                  <p className={styles.statLabel}>Total Records :</p>
                  <p className={styles.textMain}>{totalRecords}</p>
                </div>
                <div>
                  <p className={styles.statLabel}>Create :</p>
                  <p className={styles.textSuccess}>
                    {logs.filter((log) => log.action === "CREATE").length}
                  </p>
                </div>
                <div>
                  <p className={styles.statLabel}>Update :</p>
                  <p className={styles.textWarning}>
                    {logs.filter((log) => log.action === "UPDATE").length}
                  </p>
                </div>
                <div>
                  <p className={styles.statLabel}>Delete :</p>
                  <p className={styles.textDanger}>
                    {logs.filter((log) => log.action === "DELETE").length}
                  </p>
                </div>
                <div>
                  <p className={styles.statLabel}>Restore :</p>
                  <p className={styles.textInfo}>
                    {logs.filter((log) => log.action === "RESTORE").length}
                  </p>
                </div>
              </div>
            </div>

            <hr className={styles.cuttingLine} />
          </div>
        </div>
      }
    >
      {/* <div className={styles.mainContentArea}> */}
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
          <p className={styles.tableTitle}>SYSTEM AUDIT LOGS</p>
        </div>

        {/* <div className={styles.tableContainer}> */}
          <DataTable
            data={auditData}
            columns={columns}
            emptyMessage="No audit logs found."
          />
        {/* </div> */}

        </div>
        {/* <div className={styles.paginationFooter}> */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
            showOnlyActions={true}
          />
        {/* </div> */}
    </PageGridLayout>
  );
}
