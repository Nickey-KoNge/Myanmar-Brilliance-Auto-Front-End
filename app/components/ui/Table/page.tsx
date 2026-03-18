"use client";

import styles from "./page.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faCalendarDays,
  faCaretDown,
  faClockRotateLeft,
  faPlus,
  faTrashCan,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../Button/Button";
import { PageHeader } from "../PageHeader/pageheader";
import { useEffect, useState } from "react";
import { apiClient } from "@/app/features/lib/api-client";
import Link from "next/link";

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

interface Staff {
  id: string;
  staffName: string;
  image: string;
  fullAddress: string;
  position: string;
  branches_name: string;
  phone: string;
}

export default function Table() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const renderLiveButtonArea = (
    <div className={styles.headerActionArea}>
      <Link href="/staff/create" className={styles.headerbarButton}>
        <FontAwesomeIcon icon={faPlus} />
        ADD STAFF
      </Link>
    </div>
  );

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const response = await apiClient.get("/master-company/staff");
        // console.log(response.data);
        setStaffs(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStaffs();
  }, []);

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faUser} />,
          text: "Staff Management",
        }}
        actionNode={renderLiveButtonArea}
      />
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
                  {staffs.map((staff) => (
                    <tr key={staff.id}>
                      <td className={styles.staffInfo}>
                        <Image
                          src={staff.image || "/default-user.png"}
                          alt={staff.staffName}
                          width={40}
                          height={40}
                        ></Image>
                        {staff.staffName}
                      </td>
                      <td>{staff.position || "need fix"}</td>
                      <td>{staff.fullAddress}</td>
                      <td>{staff.position || "need fix"}</td>
                      <td>{staff.branches_name}</td>
                      <td>{staff.phone || "need fix"}</td>
                      <td>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => alert(`Delete ${staff.staffName}`)}
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
                  Page <span className={styles.spanText}>1</span> of{" "}
                  <span className={styles.spanText}>20</span>
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
                    <FontAwesomeIcon
                      icon={faCaretDown}
                      className={styles.icon}
                    />
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
    </>
  );
}
