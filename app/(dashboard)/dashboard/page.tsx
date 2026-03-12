import React from "react";
import styles from "./page.module.css";
import { SummaryCard } from "../../features/dashboard/components/SummaryCard";
import { AlertsTable } from "../../features/dashboard/components/AlertsTable";
import {
  faCalendarAlt,
  faCar,
  faChartLine,
  faDotCircle,
  faLaptop,
  faTags,
} from "@fortawesome/free-solid-svg-icons";
import { PageHeader } from "../../components/ui/PageHeader/pageheader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function DashboardPage() {
  const renderLiveButtonArea = (
    <div className={styles.headerActionArea}>
      {/* Calendar Button */}
      <button className={styles.calendarIconBtn}>
        <FontAwesomeIcon
          icon={faCalendarAlt}
          className={styles.calendarIcon}
        />
      </button>

      {/* Analytical Live Button */}
      <button className={styles.liveBtn}>
        {/* ::before နဲ့ အစက်လေးကို CSS ထဲမှာ ထည့်ထားတဲ့အတွက် <FontAwesomeIcon> မလိုတော့ပါဘူး */}
        ANALYTICAL LIVE
      </button>
    </div>
  );
  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faLaptop} />,
          text: "Dashboard",
        }}
        actionNode={renderLiveButtonArea}
      />

      <div className={styles.topRow}>
        <SummaryCard
          title="TOTAL RENTAL UNITS"
          value="125 Vehicles"
          subtitle="86% Utilization Rate"
          status="success"
          icon={faCar}
        />
        <SummaryCard
          title="RENTAL REVENUE"
          value="$ 429,333"
          subtitle="High Demand"
          status="danger"
          icon={faChartLine}
        />
        <SummaryCard
          title="SALES REVENUE"
          value="$ 158,483"
          subtitle="3 UNITS SOLD"
          status="neutral"
          icon={faTags}
        />
      </div>

      {/* Row 2: Charts (Placeholders for Recharts) */}
      <div className={styles.middleRow}>
        <div className={styles.chartPlaceholder}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.9rem",
              marginBottom: "1rem",
            }}
          >
            CASHFLOW: RENTAL VS SALE
          </div>
          {/* Recharts component ကို ဒီနေရာမှာ အစားထိုးပါ */}
        </div>
        <div className={styles.chartPlaceholder}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.9rem",
              marginBottom: "1rem",
            }}
          >
            CASHFLOW: RENTAL PER MONTH
          </div>
          {/* Recharts component ကို ဒီနေရာမှာ အစားထိုးပါ */}
        </div>
      </div>

      {/* Row 3: Distribution & Alerts */}
      <div className={styles.middleRow}>
        <div className={styles.chartPlaceholder}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
            RENTAL VEHICLE DISTRIBUTION
          </div>
        </div>
        <AlertsTable />
      </div>
    </>
  );
}
