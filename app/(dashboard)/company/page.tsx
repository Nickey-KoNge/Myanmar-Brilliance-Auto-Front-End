"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faCalendarDays,
  faClockRotateLeft,
  faFilter,
  faFilterCircleXmark,
  faPlus,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

// Reusable Components များကို Import လုပ်ခြင်း
// import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import TextInput from "@/app/components/ui/Inputs/TextInput";
import DateInput from "@/app/components/ui/Inputs/DateInput";
import DropdownInput from "@/app/components/ui/Inputs/DropdownInput";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import DeleteModal from "@/app/components/ui/Delete/DeleteModal";

import { apiClient } from "@/app/features/lib/api-client";
import { FilterState, useFilters } from "@/app/hooks/userFilters";
import styles from "./page.module.css";

interface Company {
  id: string;
  company_name?: string;
  reg_number: string;
  phone: string;
  email: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  image: string;
  fullAddress: string;
  website_url: string;
  establish_year: string;
  reg_exp_date: string;
}

export default function CompanyPage() {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Data States
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeRecords, setActiveRecords] = useState(0);
  const [inactiveRecords, setInactiveRecords] = useState(0);
  const [lastEditedBy, setLastEditedBy] = useState("Unknown");

  // Modal States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const PAGE_SIZE = 10;

  // Active Filters State
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    search: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  // Custom Hook for Filters
  const { filters, updateFilter, resetFilters } = useFilters(
    { search: "", startDate: "", endDate: "", status: "all" },
    (debouncedFilters: FilterState) => {
      const isFilterChanged =
        activeFilters.search !== debouncedFilters.search ||
        activeFilters.startDate !== debouncedFilters.startDate ||
        activeFilters.endDate !== debouncedFilters.endDate ||
        activeFilters.status !== debouncedFilters.status;

      setActiveFilters(debouncedFilters);

      if (isFilterChanged) {
        setCurrentPage(1);
      }
    },
  );

  // Fetch API Data
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const params: Record<string, string> = {
          page: currentPage.toString(),
          limit: PAGE_SIZE.toString(),
        };

        if (activeFilters.search)
          params.search = activeFilters.search as string;
        if (activeFilters.startDate)
          params.startDate = activeFilters.startDate as string;
        if (activeFilters.endDate)
          params.endDate = activeFilters.endDate as string;

        const queryString = new URLSearchParams(params).toString();
        const response = await apiClient.get(
          `/master-company/company?${queryString}`,
        );

        const res = response as unknown as {
          data?:
            | Company[]
            | {
                data?: Company[];
                total?: number;
                totalPages?: number;
                activeCount?: number;
                inactiveCount?: number;
                lastEditedBy: string;
              };
          total?: number;
          totalPages?: number;
          activeCount?: number;
          inactiveCount?: number;
          lastEditedBy?: string;
        };

        let companyList: Company[] = [];
        let total = 0;
        let totalPagesCount = 1;

        if (res && typeof res === "object") {
          if (Array.isArray(res.data)) {
            companyList = res.data;
            total = res.total || 0;
            totalPagesCount = res.totalPages || 1;
            setActiveRecords(res.activeCount || 0);
            setInactiveRecords(res.inactiveCount || 0);
            setLastEditedBy(res.lastEditedBy || "Unknown");
          } else if (
            res.data &&
            typeof res.data === "object" &&
            Array.isArray(res.data.data)
          ) {
            companyList = res.data.data;
            total = res.data.total || 0;
            totalPagesCount = res.data.totalPages || 1;
          }
        }

        setCompanies(companyList);
        setTotalRecords(total);
        setTotalPages(totalPagesCount);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        setCompanies([]);
      }
    };

    fetchCompanies();
  }, [currentPage, activeFilters]);

  const handleDeleteSuccess = (id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  };

  const columns = [
    {
      header: "Company Info",
      key: "companyInfo",
      render: (company: Company) => {
        const compName = company.company_name || "Unknown";
        return (
          <div className={styles.info}>
            {company.image ? (
              <Image
                src={company.image}
                alt={compName}
                width={40}
                height={40}
                className={styles.image}
                unoptimized
              />
            ) : (
              <div className={styles.defaultImage}>
                <FontAwesomeIcon icon={faBuilding} />
              </div>
            )}
            <div>
              <div className={styles.textBold}>{compName}</div>
              <div className={[styles.textSmall, styles.textMuted].join(" ")}>
                Reg: {company.reg_number}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Owner Details",
      key: "owner",
      render: (company: Company) => (
        <div>
          <div className={styles.textBold}>{company.owner_name}</div>
          <div className={[styles.textSmall, styles.textInfo].join(" ")}>
            {company.owner_email}
          </div>
          <div className={styles.textSmall}>{company.owner_phone}</div>
        </div>
      ),
    },
    {
      header: "Contact & Web",
      key: "contact",
      render: (company: Company) => (
        <div>
          <div>{company.email}</div>
          <div className={[styles.textSmall, styles.textMuted].join(" ")}>
            {company.website_url}
          </div>
          <div className={styles.textSmall}>{company.phone}</div>
        </div>
      ),
    },
    {
      header: "Full Address",
      key: "fullAddress",
      render: (company: Company) => (
        <div className={styles.textSmall}>{company.fullAddress || "-"}</div>
      ),
    },
    {
      header: "Timeline",
      key: "dates",
      render: (company: Company) => (
        <div>
          <div className={styles.timelineText}>
            <span className={styles.textBold}>Est : </span>{" "}
            {company.establish_year}
          </div>
          <div className={styles.expireText}>
            <span className={styles.textBold}>Exp : </span>{" "}
            {company.reg_exp_date?.split("T")[0] || "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (company: Company) => (
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCompany({
              id: company.id,
              name: company.company_name || "",
            });
            setIsDeleteOpen(true);
          }}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageGridLayout
        isSidebarOpen={isFilterOpen}
        sidebar={
          <div className={styles.sidebarWrapper}>
            <div className={styles.topSection}>
              <p className={styles.gridBoxTitle}>Company Search</p>
              <hr className={styles.cuttingLine} />

              <div className={styles.searchContainer}>
                <TextInput
                  label="Searching"
                  placeholder="Search by name, email, reg no..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />

                <div className={styles.filterRow}>
                  <DateInput
                    label="From"
                    value={filters.startDate}
                    onChange={(e) => updateFilter("startDate", e.target.value)}
                    rightIcon={faCalendarDays}
                  />
                  <DateInput
                    label="To"
                    value={filters.endDate}
                    onChange={(e) => updateFilter("endDate", e.target.value)}
                    rightIcon={faCalendarDays}
                  />
                </div>

                <div className={styles.filterRow}>
                  <DropdownInput
                    label="Status"
                    options={[
                      { id: "active", name: "Active" },
                      { id: "inactive", name: "Inactive" },
                    ]}
                    valueKey="id"
                    nameKey="name"
                    value={(filters.status as string) || "all"}
                    onChange={(e) => updateFilter("status", e.target.value)}
                    placeholder="All Status"
                  />
                </div>

                <ActionBtn
                  type="reset"
                  variant="action"
                  fullWidth={true}
                  onClick={resetFilters}
                >
                  reset
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
                    <p className={styles.statLabel}>Total Company :</p>
                    <p className={styles.textDanger}>{totalRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Active Company :</p>
                    <p className={styles.textSuccess}>{activeRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Inactive Company :</p>
                    <p className={styles.textDanger}>{inactiveRecords}</p>
                  </div>
                </div>
              </div>

              <hr className={styles.cuttingLine} />
              <p className={styles.lastEdited}>
                Last Edited :{" "}
                <span className={styles.spanText}>{lastEditedBy}</span>
              </p>
            </div>
          </div>
        }
      >
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
            <p className={styles.tableTitle}>COMPANY MASTER RECORDS</p>

            <div className={styles.headerActionArea}>
              <ActionBtn
                leftIcon={isFilterOpen ? faFilterCircleXmark : faFilter}
                variant="info"
                onClick={() => setIsFilterOpen((prev) => !prev)}
              />
              <NavigationBtn href="/company/Addcompany" leftIcon={faPlus}>
                add company
              </NavigationBtn>
            </div>
          </div>
          <div className={styles.tableBody}>
            <DataTable
              data={companies}
              columns={columns}
              onRowClick={(company) =>
                router.push(`/company/Updatecompany/${company.id}`)
              }
            />

            <div className={styles.paginationBottom}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
                showOnlyActions={true}
              />
            </div>
          </div>
        </div>
      </PageGridLayout>

      {/* Delete Modal */}
      {isDeleteOpen && selectedCompany && (
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          itemName={selectedCompany.name}
          name="Company"
          id={selectedCompany.id}
          apiRoute="master-company/company"
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
