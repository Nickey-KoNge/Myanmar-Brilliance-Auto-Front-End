"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/features/lib/api-client";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faClockRotateLeft,
  faPlus,
  faTrashCan,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { FilterState, useFilters } from "@/app/hooks/userFilters";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";

import styles from "./page.module.css";
import TextInput from "@/app/components/ui/Inputs/TextInput";
import DateInput from "@/app/components/ui/Inputs/DateInput";
import DropdownInput from "@/app/components/ui/Inputs/DropdownInput";

import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import DeleteModal from "@/app/components/ui/Delete/DeleteModal";
import { set } from "react-hook-form";

interface AssignmentRecord {
  id: string;
  driver_id: string;
  driver_name: string;
  driver_image: string;
  driver_nrc: string;
  phone: string;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_image: string;
  vehicle_license: string;
  current_odometer: string;
  station_id: string;
  station_name: string;
  branch_name: string;
  status: string;
  createdAt: string;
}

interface PaginatedResponse {
  data: AssignmentRecord[];

  total: number;
  totalPages: number;
  currentPage: number;
}

export default function AssignmentListPage() {
  const router = useRouter();
  const [records, setRecords] = useState<AssignmentRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [activeRecords, setActiveRecords] = useState(0);
  const [inactiveRecords, setInactiveRecords] = useState(0);
  const [lastEditedBy, setLastEditedBy] = useState("");

  const PAGE_SIZE = 10;

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
    name: "",
  });

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    search: "",
    startDate: "",
    endDate: "",
  });

  const { filters, updateFilter, resetFilters } = useFilters(
    { search: "", startDate: "", endDate: "" },
    (debouncedFilters: FilterState) => {
      const isFilterChanged =
        debouncedFilters.search !== filters.search ||
        debouncedFilters.startDate !== filters.startDate ||
        debouncedFilters.endDate !== filters.endDate;

      setActiveFilters(debouncedFilters);
      if (isFilterChanged) {
        setCurrentPage(1);
      }
    },
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: Record<string, string> = {
          page: currentPage.toString(),
          limit: PAGE_SIZE.toString(),
          ...(filters.search && { search: String(filters.search) }),
          ...(filters.startDate && { startDate: String(filters.startDate) }),
          ...(filters.endDate && { endDate: String(filters.endDate) }),
        };

        const queryString = new URLSearchParams(params).toString();

        const response = await apiClient.get(
          `/master-vehicle/vehicle-driver-assign?${queryString}`,
        );
        const res = response as unknown as PaginatedResponse;

        const records = res?.data || [];
        const total = res.total || 0;
        const totalPagesCount = res?.totalPages || 1;

        setRecords(records);
        setTotalRecords(total);
        setTotalPages(totalPagesCount);

        setActiveRecords(records.filter((r) => r.status === "Ongoing").length);
        setInactiveRecords(
          records.filter((r) => r.status === "Completed").length,
        );
        setLastEditedBy("Unknown");

        // if (res.success && res.data) {
        //   setRecords(res.data.data || []);
        //   setTotalRecords(res.data.total || 0);
        //   setTotalPages(res.data.totalPages || 1);
        // }
      } catch (error) {
        console.error("Failed to fetch records:", error);
        setRecords([]);
      }
    };
    fetchData();
  }, [currentPage, filters]);

  const handleDeleteSuccess = (id: string) => {
    setRecords((prev) => prev.filter((row) => row.id !== id));
  };

  const columns = [
    {
      header: "Driver Info",
      key: "driverInfo",
      render: (row: AssignmentRecord) => (
        <div className={styles.info}>
          {row.driver_image ? (
            <Image
              src={row.driver_image}
              alt={row.driver_name}
              width={40}
              height={40}
              unoptimized
              className={styles.image}
            />
          ) : (
            <div className={styles.defaultImage}>
              <FontAwesomeIcon icon={faUserTie} />
            </div>
          )}
          <div>
            <div className={styles.textBold}>{row.driver_name}</div>
            <div className={[styles.textSmall, styles.textMuted].join(" ")}>
              <span className={styles.textBold}>NRC : </span>{" "}
              {row.driver_nrc || "-"}
            </div>
            <div
              className={[
                styles.textSmall,
                row.status === "Ongoing"
                  ? styles.textSuccess
                  : styles.textDanger,
              ].join(" ")}
            >
              {row.status}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Vehicle Details",
      key: "vehicleDetails",
      render: (row: AssignmentRecord) => (
        <div>
          <div className={styles.textBold}>{row.vehicle_name}</div>
          <div className={[styles.textSmall, styles.textInfo].join(" ")}>
            <span className={styles.textBold}>Plate : </span>{" "}
            {row.vehicle_license}
          </div>
          <div className={styles.textSmall}>
            <span className={styles.textBold}>Odo : </span>{" "}
            {row.current_odometer} km
          </div>
        </div>
      ),
    },
    {
      header: "Station & Branch",
      key: "assignment",
      render: (row: AssignmentRecord) => (
        <div>
          <div className={styles.textBold}>{row.station_name}</div>
          <div className={[styles.textSmall, styles.textMuted].join(" ")}>
            <span className={styles.textBold}>Branch : </span> {row.branch_name}
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      key: "contact",
      render: (row: AssignmentRecord) => (
        <div className={[styles.textSmall, styles.textBold].join(" ")}>
          {row.phone}
        </div>
      ),
    },
    {
      header: "Timeline",
      key: "timeline",
      render: (row: AssignmentRecord) => (
        <div>
          <div>
            <span className={styles.textBold}>Created : </span>
            {row.createdAt ? row.createdAt.split("T")[0] : "-"}
          </div>
          <div className={styles.textMuted}>
            <span className={styles.textBold}>Time : </span>
            {row.createdAt ? row.createdAt.split("T")[1].substring(0, 5) : "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (row: AssignmentRecord) => (
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            setDeleteModal({ isOpen: true, id: row.id, name: row.driver_name });
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
        sidebar={
          <div className={styles.sidebarWrapper}>
            <div className={styles.topSection}>
              <p className={styles.gridBoxTitle}>Record Search</p>
              <hr className={styles.cuttingLine} />
              <div className={styles.searchContainer}>
                <TextInput
                  label="Searching"
                  placeholder="Driver or Vehicle..."
                  value={String(filters.search || "")}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />
                <div className={styles.filterRow}>
                  <DateInput
                    label="From"
                    value={String(filters.startDate || "")}
                    onChange={(e) => updateFilter("startDate", e.target.value)}
                    rightIcon={faCalendarDays}
                  />
                  <DateInput
                    label="To"
                    value={String(filters.endDate || "")}
                    onChange={(e) => updateFilter("endDate", e.target.value)}
                    rightIcon={faCalendarDays}
                  />
                </div>
                <ActionBtn
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
                    <p className={styles.statLabel}>Total Trips :</p>
                    <p className={styles.textDanger}>{totalRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Ongoing Trips :</p>
                    <p className={styles.textSuccess}>{activeRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Complete Trips :</p>
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
        <div>
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
            <p className={styles.tableTitle}>ASSIGNMENT RECORDS</p>
            <div className={styles.headerActionArea}>
              {/* <NavigationBtn href="/vehicle-driver-assign" leftIcon={faPlus}>
                Add Assignment
              </NavigationBtn> */}
            </div>
          </div>

          <DataTable
            columns={columns}
            data={records}
            onRowClick={(row) =>
              router.push(`/vehicle/Assignment/Update/${row.id}`)
            }
            emptyMessage="No assignment records found."
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

      {deleteModal.isOpen && deleteModal.id && (
        <DeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
          itemName={deleteModal.name}
          name="Assignment"
          id={deleteModal.id}
          apiRoute="master-vehicle/vehicle-driver-assign"
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
