import React from "react";
import styles from "./AlertsTable.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

export const AlertsTable = () => {
  const alerts = [
    {
      vehicle: "6E - 3366",
      status: "LICENSE EXPIRED",
      date: "2026-9-16",
      type: "danger",
    },
    {
      vehicle: "8Q - 1154",
      status: "OIL SERVICE",
      date: "IN - 5",
      type: "warning",
    },
    {
      vehicle: "2D - 5543",
      status: "BRAKE CHECK",
      date: "IN - 2",
      type: "warning",
    },
  ];
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        CRITICAL ALERTS{" "}
        <FontAwesomeIcon icon={faExclamationTriangle} color="#f87171" />
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>VEHICLE - STATUS</th>
            <th>CONDITION EXPIRE</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((a, i) => (
            <tr key={i}>
              <td
                className={
                  a.type === "danger"
                    ? styles.statusDanger
                    : styles.statusWarning
                }
              >
                <span style={{ marginRight: "1rem" }}>
                  {a.vehicle}
                </span>{" "}
                {a.status}
              </td>
              <td>{a.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
