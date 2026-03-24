"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faBuilding,
  faCalendarDays,
  faCaretDown,
  faClockRotateLeft,
  faPlus,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import { Button } from "@/app/components/ui/Button/Button";
import { apiClient } from "@/app/features/lib/api-client";
import styles from "./Company.module.css";
// Import your new custom modal! Make sure the path matches where you saved it.
import DeleteModal from "@/app/components/ui/Delete/DeleteModal";

const TABLE_HEADERS = [
  "Company Info",
  "Email",
  "Address",
  "Website",
  "Reg No",
  "Phone",
  "Actions",
];

const FILTERS = [
  {
    label: "Status",
    options: ["Active", "Inactive"],
  },
];

interface Company {
  id: string;
  name: string;
  email: string;
  address: string;
  website: string;
  regNo: string;
  phone: string;
  logo?: string;
}

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  
  // --- NEW: Modal State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // ------------------------

  const router = useRouter();

  const renderLiveButtonArea = (
    <div className={styles.headerActionArea}>
      <Link href="/company/create" className={styles.headerbarButton}>
        <FontAwesomeIcon icon={faPlus} />
        ADD COMPANY
      </Link>
    </div>
  );

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiClient.get("/master-company/company");
        setCompanies(response.data);
      } catch (error) {
        console.error(error);
        // Fallback to mock data if API fails
        setCompanies([
          {
            id: "1",
            name: "Myanmar Brilliance Auto",
            email: "myanmarbrillianceauto@gmail.com",
            address: "No 22, Aung Myitt Thar road, Bago, Myanmar",
            website: "https://myanmarbrillianceauto.com",
            regNo: "10387373635",
            phone: "0974645555",
            logo: "",
          },
        ]);
      }
    };

    fetchCompanies();
  }, []);

  // --- NEW: Handle Clicking the Trash Can ---
  const handleDeleteClick = (id: string, name: string) => {
    setCompanyToDelete({ id, name });
    setModalOpen(true);
  };

  // --- NEW: Handle the Actual Deletion from the Modal ---
  const confirmDelete = async () => {
    if (!companyToDelete) return;
    setIsDeleting(true);

    try {
      await apiClient.delete(`/master-company/company/${companyToDelete.id}`);
      setCompanies((prev) => prev.filter((c) => c.id !== companyToDelete.id));
      setModalOpen(false); // Close the modal on success
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    } finally {
      setIsDeleting(false);
      setCompanyToDelete(null); // Reset the selected company
    }
  };

  return (
    <>
      {/* --- NEW: The Delete Modal Component --- */}
<DeleteModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  itemName={companyToDelete?.name || ""}
  name="Company"
  id={companyToDelete?.id || ""}
  apiRoute="master-company/company"
  onDeleteSuccess={(deletedId) => {
    // This removes the deleted company from your list automatically
    setCompanies((prev) => prev.filter((c) => c.id !== deletedId));
  }}
/>

      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faBuilding} />,
          text: "Company Management",
        }}
        actionNode={renderLiveButtonArea}
      />
      <div className={styles.gridContainer}>
        {/* TABLE SECTION */}
        <section className={styles.gridBox}>
          <div className={styles.spacer}>
            <div>
              <p className={styles.gridBoxTitle}>COMPANY MASTER RECORDS</p>

              <table className={styles.table}>
                <thead>
                  <tr>
                    {TABLE_HEADERS.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr
                      key={company.id}
                      onClick={() => router.push(`/company/${company.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className={styles.staffInfo}>
                        {company.logo ? (
                          <Image
                            src={company.logo}
                            alt={company.name}
                            width={40}
                            height={40}
                            className={styles.avatar}
                            unoptimized
                          />
                        ) : (
                          <div className={styles.placeholderLogo}>
                            <FontAwesomeIcon icon={faBuilding} />
                          </div>
                        )}
                        {company.name}
                      </td>
                      <td>{company.email || "N/A"}</td>
                      <td>{company.address || "N/A"}</td>
                      <td>{company.website || "N/A"}</td>
                      <td>{company.regNo || "N/A"}</td>
                      <td>{company.phone || "N/A"}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
  className={styles.deleteBtn}
  // We use modalOpen to disable the button while the process is happening
  disabled={modalOpen} 
  onClick={(e) => {
    e.stopPropagation(); // Stop from going to the update page
    setCompanyToDelete({ id: company.id, name: company.company_name || company.name || "" });
    setModalOpen(true);
  }}
>
  <FontAwesomeIcon icon={faTrashCan} />
</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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

        {/* RIGHT PANEL (SIDEBAR) */}
        <aside className={styles.gridBox}>
          <p className={styles.gridBoxTitle}>Company Search</p>

          <hr className={styles.cuttingLine} />

          <div className={styles.searchContainer}>
            <div className={styles.field}>
              <label className={styles.label}>Searching</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="Search by name, email, reg no..."
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
                  <p className={styles.statLable}>Total Company :</p>
                  <p className={styles.textDanger}>{companies.length}</p>
                </div>
                <div>
                  <p className={styles.statLable}>Active Company :</p>
                  <p className={styles.textSuccess}>
                    {companies.length > 0 ? companies.length - 1 : 0}
                  </p>
                </div>
                <div>
                  <p className={styles.statLable}>Inactive Company :</p>
                  <p className={styles.textDanger}>
                    {companies.length > 0 ? 1 : 0}
                  </p>
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