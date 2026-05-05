"use client";
// import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import {
  faCalendarDays,
  faClockRotateLeft,
  faPlus,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { Button } from "@/app/components/ui/Button/Button";
import { useEffect, useState } from "react";
import React from "react";

import { useRouter } from "next/navigation";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import { apiClient } from "@/app/features/lib/api-client";
import styles from "./page.module.css";
import DeleteModal from "../../components/ui/Delete/DeleteModal";
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import TextInput from "@/app/components/ui/Inputs/TextInput";
import DateInput from "@/app/components/ui/Inputs/DateInput";
import { FilterState, useFilters } from "@/app/hooks/userFilters";
// import { set } from "react-hook-form";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";

interface Branch {
  id: string;
  branches_name: string;
  company_id: string;
  company_name: string;
  gps_location: string;
  phone: string;
  description: string;
  fullAddress: string;
}

export default function BranchPage() {
  const router = useRouter();
  const [branchData, setBranchData] = React.useState<Branch[]>([]);

  const [activeRecords, setActiveRecords] = useState(0);
  const [inactiveRecords, setInactiveRecords] = useState(0);
  const [lastEditedBy, setLastEditedBy] = useState("Unknown");
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedBranch, setSelectedBranch] = React.useState<Branch | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const PAGE_SIZE = 10;

  //Active Filters State
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    search: "",
    startDate: "",
    endDate: "",
  });

  // Custom Hook
  const { filters, updateFilter, resetFilters } = useFilters(
    { search: "", startDate: "", endDate: "" },
    (debouncedFilters: FilterState) => {
      const isFilterChanged =
        activeFilters.search !== debouncedFilters.search ||
        activeFilters.startDate !== debouncedFilters.startDate ||
        activeFilters.endDate !== debouncedFilters.endDate;

      setActiveFilters(debouncedFilters);

      if (isFilterChanged) {
        setCurrentPage(1);
      }
    },
  );

  const columns = [
    {
      header: "Branches Info",
      key: "branches_name",
    },
    { header: "Company", key: "company_name" },
    { header: "Location", key: "gps_location" },
    { header: "Address", key: "fullAddress" },
    { header: "Description", key: "description" },
    { header: "Phone", key: "phone" },
    {
      header: "Actions",
      key: "actions",
      render: (branch: Branch) => (
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click trigger
            setSelectedBranch(branch);
            setIsDeleteOpen(true);
          }}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      ),
    },
  ];
  useEffect(() => {
    const fetchBranchData = async () => {
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
          `/master-company/branches?${queryString}`,
        );

        const res = response as unknown as {
          data?:
            | Branch[]
            | {
                data?: Branch[];
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
        let branchList: Branch[] = [];
        let total = 0;
        let totalPages = 1;

        if (res && typeof res === "object") {
          if (Array.isArray(res.data)) {
            branchList = res.data;
            total = res.total || 0;
            totalPages = res.totalPages || 1;
            setActiveRecords(res.activeCount || 0);
            setInactiveRecords(res.inactiveCount || 0);
            setLastEditedBy(res.lastEditedBy || "Unknown");
          } else if (
            res.data &&
            typeof res.data === "object" &&
            Array.isArray(res.data.data)
          ) {
            branchList = res.data.data;
            total = res.data.total || 0;
            totalPages = res.data.totalPages || 1;
          }
        }

        setBranchData(branchList);
        setTotalRecords(total);
        setTotalPages(totalPages);
      } catch (error) {
        console.error("Failed to fetch branch:", error);
        setBranchData([]);
      }
    };

    fetchBranchData();
  }, [currentPage, activeFilters]);

  // console.log("Fetched Branch Data:", branchData);

  // remove deleted branch from table data without refetching
  const handleDeleteSuccess = (id: string) => {
    setBranchData((prevData) => prevData.filter((row) => row.id !== id));
  };

  return (
    <>
      <PageGridLayout
        sidebar={
          <div className={styles.sidebarWrapper}>
            <div className={styles.topSection}>
              <p className={styles.gridBoxTitle}>Branch Search</p>
              <hr className={styles.cuttingLine} />

              <div className={styles.searchContainer}>
                <TextInput
                  label="Searching"
                  placeholder="Search by name, email..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />

                <div className={styles.filterRow}>
                  <div className={styles.filterRow}>
                    <DateInput
                      label="From"
                      value={filters.startDate}
                      onChange={(e) =>
                        updateFilter("startDate", e.target.value)
                      }
                      rightIcon={faCalendarDays}
                    />
                  </div>

                  <DateInput
                    label="To"
                    value={filters.endDate}
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
                    <p className={styles.statLabel}>Total Branches :</p>
                    <p className={styles.textDanger}>{totalRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Active Branches :</p>
                    <p className={styles.textSuccess}>{activeRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Inactive Branches :</p>
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
            <p className={styles.tableTitle}>BRANCHES MASTER RECORDS</p>

            <div className={styles.headerActionArea}>
              <NavigationBtn href="/branch/Addbranch" leftIcon={faPlus}>
                add Branch
              </NavigationBtn>
            </div>
          </div>

          <DataTable
            data={branchData}
            columns={columns}
            onRowClick={(branch) =>
              router.push(`/branch/Updatebranch/${branch.id}`)
            }
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
      {isDeleteOpen && selectedBranch && (
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          itemName={selectedBranch.branches_name}
          name="Branch"
          id={selectedBranch.id}
          apiRoute="master-company/branches"
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
