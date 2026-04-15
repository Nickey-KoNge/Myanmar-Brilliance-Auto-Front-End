"use client";

import React, { useEffect, useState } from "react";
import { UserActivityChart } from "@/app/components/activitychart/UserActivityChart";
import { ActionTypePieChart } from "@/app/components/activitychart/ActionTypePieChart";
import { ModuleActivityChart } from "@/app/components/activitychart/ModuleActivityChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { apiClient } from "@/app/features/lib/api-client";
import styles from "./page.module.css";
import {
  faGauge,
  faShieldHalved,
  faUsers,
  faFileLines,
  faTriangleExclamation,
  faDownload,
  faRotateRight,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

interface SummaryData {
  totalLogs: number;
  activeUsers: number;
  topModule: string;
  criticalActions: number;
}

interface AuditLog {
  id: string;
  action: string;
  performed_by: string;
  entity_name: string;
  entity_id: string;
  created_at: string;
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

function getBadgeClass(action: string) {
  switch (action) {
    case "CREATE":
    case "RESTORE":
      return styles.badgeSuccess;
    case "DELETE":
      return styles.badgeDanger;
    case "UPDATE":
      return styles.badgeInfo;
    default:
      return styles.badgeWarning;
  }
}

export default function AuditDashboardPage() {
  const [summary, setSummary] = useState<SummaryData>({
    totalLogs: 0,
    activeUsers: 0,
    topModule: "Loading...",
    criticalActions: 0,
  });
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    entityName: "",
    action: "",
  });

  const [triggerFetch, setTriggerFetch] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const queryStr = params.toString() ? `?${params.toString()}` : "";

      const summaryRes = (await apiClient.get(
        `/master-audit/analytics/summary${queryStr}`,
      )) as { data?: SummaryData } | SummaryData;

      const summaryData =
        summaryRes && "data" in summaryRes && summaryRes.data
          ? (summaryRes.data as SummaryData)
          : (summaryRes as SummaryData);

      setSummary(summaryData);

      const logsRes = (await apiClient.get(
        `/master-audit?limit=5&${params.toString()}`,
      )) as { data?: { data?: AuditLog[] } | AuditLog[] } | AuditLog[];

      let logsArray: AuditLog[] = [];
      if (Array.isArray(logsRes)) {
        logsArray = logsRes;
      } else if (logsRes?.data) {
        if (Array.isArray(logsRes.data)) {
          logsArray = logsRes.data;
        } else if (
          Array.isArray((logsRes.data as { data?: AuditLog[] }).data)
        ) {
          logsArray = (logsRes.data as { data: AuditLog[] }).data;
        }
      }

      setRecentLogs(logsArray);
    } catch (error) {
      console.error("Error fetching audit dashboard data:", error);
    }
  };

  const handleRefresh = () => {
    setStartDate("");
    setEndDate("");

    setTriggerFetch((prev) => prev + 1);
  };
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        entity_name: exportOptions.entityName,
        search: exportOptions.action,
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const token = Cookies.get("access_token");

      if (!token) {
        toast.error("Authentication Error: Please login again.");
        return;
      }

      const response = await fetch(
        `${apiUrl}/master-audit/export/excel?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Token ထည့်ပေးခြင်း
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const today = new Date().toISOString().slice(0, 10);
      link.setAttribute("download", `Audit_Report_${today}.xlsx`);

      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      setShowExportModal(false);
      toast.success("Excel exported successfully!");
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Export failed! Check console.");
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, triggerFetch]);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>
          <FontAwesomeIcon icon={faGauge} className={styles.titleIcon} />
          System Audit Dashboard
        </h1>

        <div className={styles.headerActions}>
          <div className={styles.filterRow}>
            <DateInput
              label="From Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              rightIcon={faCalendarDays}
            />
            <DateInput
              label="To Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              rightIcon={faCalendarDays}
            />
          </div>
          <div className={styles.actionBtnsGroup}>
            <ActionBtn
              type="button"
              variant="action"
              fullWidth={false}
              onClick={handleRefresh}
            >
              <FontAwesomeIcon icon={faRotateRight} />
            </ActionBtn>
            <ActionBtn
              type="button"
              variant="action"
              fullWidth={false}
              onClick={() => setShowExportModal(true)}
            >
              <FontAwesomeIcon icon={faDownload} /> Export Report
            </ActionBtn>
          </div>
        </div>
      </div>

      {/* Real-world Metrics Grid */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.cardLogs}`}>
          <div>
            <p className={styles.cardLabel}>Total Logs</p>
            <p className={styles.cardValue}>
              {summary.totalLogs.toLocaleString()}
            </p>
          </div>
          <FontAwesomeIcon icon={faShieldHalved} className={styles.cardIcon} />
        </div>

        <div className={`${styles.summaryCard} ${styles.cardAlerts}`}>
          <div>
            <p className={styles.cardLabel}>Failed / Critical Actions</p>
            <p className={styles.cardValue}>{summary.criticalActions}</p>
          </div>
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className={styles.cardIcon}
          />
        </div>

        <div className={`${styles.summaryCard} ${styles.cardUsers}`}>
          <div>
            <p className={styles.cardLabel}>Active Users</p>
            <p className={styles.cardValue}>{summary.activeUsers}</p>
          </div>
          <FontAwesomeIcon icon={faUsers} className={styles.cardIcon} />
        </div>

        <div className={`${styles.summaryCard} ${styles.cardModule}`}>
          <div>
            <p className={styles.cardLabel}>Top Module</p>
            <p className={styles.cardValue}>{summary.topModule}</p>
          </div>
          <FontAwesomeIcon icon={faFileLines} className={styles.cardIcon} />
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGridRow}>
        <UserActivityChart startDate={startDate} endDate={endDate} />
        <ActionTypePieChart />
      </div>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        <div className={styles.chartWrapper}>
          <ModuleActivityChart />
        </div>

        {/* Dynamic Recent Logs */}
        <div className={styles.recentLogsWrapper}>
          <h3 className={styles.sectionTitle}>Recent Activities</h3>
          <div className={styles.logList}>
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div key={log.id} className={styles.logItem}>
                  <span
                    className={`${styles.logBadge} ${getBadgeClass(log.action)}`}
                  >
                    {log.action}
                  </span>
                  <span className={styles.logUser}>{log.performed_by}</span>{" "}
                  {log.action.toLowerCase()} record in{" "}
                  <strong>{log.entity_name}</strong>
                  
                  <span className={styles.logTime}>
                    {timeAgo(log.created_at)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No recent activities.</p>
            )}
          </div>
          <Link className={styles.btnViewAll} href="/audit">
            <span>View Full Audit Trail &rarr;</span>
          </Link>
        </div>
      </div>
      {/* Modal JSX */}
      {showExportModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.exportModal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Export Audit Report</h3>
              <button
                className={styles.btnCloseIcon}
                onClick={() => setShowExportModal(false)}
                title="Close"
              >
                &times;
              </button>
            </div>

            <p className={styles.modalSubtitle}>
              Current Range: <strong>{startDate || "All"}</strong> to{" "}
              <strong>{endDate || "Today"}</strong>
            </p>

            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label>Filter by Module</label>
                <select
                  value={exportOptions.entityName}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      entityName: e.target.value,
                    })
                  }
                  className={styles.customSelect}
                >
                  <option value="">All Modules</option>
                  <option value="company">Company</option>
                  <option value="branches">Branches</option>
                  <option value="stations">Stations</option>
                  <option value="groups">Groups</option>
                  <option value="staff">Staff</option>
                  <option value="driver">Driver</option>
                  <option value="vehicle_models">Vehicle Model</option>
                  <option value="vehicle_brands">Vehicle Brands</option>
                  <option value="vehicle">Vehicles</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Filter by Action</label>
                <select
                  value={exportOptions.action}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      action: e.target.value,
                    })
                  }
                  className={styles.customSelect}
                >
                  <option value="">All Actions</option>
                  <option value="DELETE">Delete (Critical)</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancel}
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
              <button className={styles.btnDownload} onClick={handleExport}>
                <FontAwesomeIcon
                  icon={faDownload}
                  style={{ marginRight: "6px" }}
                />
                Download Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
