"use client";

import styles from "./Table.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faCalendarDays,
  faCaretDown,
  faClockRotateLeft,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../Button/Button";

const TABLE_HEADERS = [
  "Staff Info",
  "Email",
  "Address",
  "Role",
  "Branch",
  "Phone",
  "Actions",
];

const FILTERS = [
  {
    label: "Branch",
    options: ["Yangon", "Mandalay", "Naypyidaw", "Bago"],
  },
  {
    label: "Role",
    options: ["Driver", "Cleaner", "Manager", "Accountant"],
  },
];

const STAFFS = [
  {
    name: "Aung",
    email: "aung@gmail.com",
    address: "Yangon",
    role: "Driver",
    branch: "Yangon Branch",
    phone: "091231223123",
    img: "/aung.jpg",
  },
  {
    name: "Min",
    email: "min@gmail.com",
    address: "Mandalay",
    role: "Security",
    branch: "Mandalay Branch",
    phone: "091231223124",
    img: "/min.jpg",
  },
];

export default function Table() {
  return (
    <div className={styles.gridContainer}>
      <section className={styles.gridBox}>
        <div className={styles.spacer}>
          <div>
            <p className={styles.gridBoxTitle}>EMPLOYEE MASTER RECORDS</p>

            {/* table */}
            <table className={styles.table}>
              <thead>
                <tr>
                  {TABLE_HEADERS.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAFFS.map((staff) => (
                  <tr key={staff.email}>
                    <td className={styles.staffInfo}>
                      <Image
                        src={staff.img}
                        alt={staff.name}
                        width={40}
                        height={40}
                      />
                      <span>{staff.name}</span>
                    </td>
                    <td>{staff.email}</td>
                    <td>{staff.address}</td>
                    <td>{staff.role}</td>
                    <td>{staff.branch}</td>
                    <td>{staff.phone}</td>
                    <td>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => alert(`Delete ${staff.name}`)}
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className={styles.pagination}>
            <p>
              Showing <span className={styles.spanText}>1</span> to{" "}
              <span className={styles.spanText}>10</span> of{" "}
              <span className={styles.spanText}>200</span> total records
            </p>
            <div className={styles.pageActions}>
              <span>
                Page <span className={styles.spanText}>1</span> of 20
              </span>
              <button>
                <FontAwesomeIcon icon={faAngleLeft} />
              </button>
              <button>
                <FontAwesomeIcon icon={faAngleRight} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside className={styles.gridBox}>
        <p className={styles.gridBoxTitle}>Employee Search</p>

        <hr className={styles.cuttingLine} />

        <div className={styles.searchContainer}>
          <div className={styles.field}>
            <label className={styles.label}>Searching</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Search by name, email, address..."
              />
            </div>
          </div>

          <div className={styles.filterRow}>
            {["From", "To"].map((label) => (
              <div key={label} className={styles.field}>
                <label className={styles.label}>{label}</label>
                <div className={styles.inputWrapper}>
                  <input type="date" className={styles.dateSearch} />
                  <FontAwesomeIcon
                    icon={faCalendarDays}
                    className={styles.icon}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.filterRow}>
            {FILTERS.map((filter) => (
              <div key={filter.label} className={styles.field}>
                <label className={styles.label}>{filter.label}</label>
                <div className={styles.inputWrapper}>
                  <select defaultValue="all">
                    <option value="all">All {filter.label}s</option>
                    {filter.options.map((opt) => (
                      <option key={opt} value={opt.toLowerCase()}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <FontAwesomeIcon icon={faCaretDown} className={styles.icon} />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.btnBox}>
            <Button className={styles.resetBtn}>Reset Filters</Button>
          </div>

          <hr className={styles.cuttingLine} />

          <div className={styles.recentRecord}>
            <span>
              <FontAwesomeIcon icon={faClockRotateLeft} />
            </span>
            <p className={styles.recentTitle}>RECENT RECORD</p>

            <span />
            <div className={styles.stat}>
              <div>
                <p className={styles.statLable}>Total Staff :</p>
                <p className={styles.textDanger}>40</p>
              </div>
              <div>
                <p className={styles.statLable}>Active Staff :</p>
                <p className={styles.textSuccess}>36</p>
              </div>
              <div>
                <p className={styles.statLable}>Inactive Staff :</p>
                <p className={styles.textDanger}>4</p>
              </div>
            </div>
          </div>

          <hr className={styles.cuttingLine} />

          <p className={styles.lastEdited}>
            Last Edited :{" "}
            <span className={styles.spanText}>Nickey (Admin)</span>
          </p>
        </div>
      </aside>
    </div>
  );
}
