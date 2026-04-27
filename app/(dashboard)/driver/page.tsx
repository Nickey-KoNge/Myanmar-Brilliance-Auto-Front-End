"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faClockRotateLeft,
  faPlus,
  faTrashCan,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

// Components
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import TextInput from "@/app/components/ui/Inputs/TextInput";
import DateInput from "@/app/components/ui/Inputs/DateInput";
import DropdownInput from "@/app/components/ui/Inputs/DropdownInput";
import DeleteModal from "@/app/components/ui/Delete/DeleteModal";

// Styles
import styles from "./page.module.css";
import { apiClient } from "@/app/features/lib/api-client";

// Hook
import { useFilters, FilterState } from "@/app/hooks/userFilters";

interface Driver {
  id: string;
  driver_name: string;
  nrc: string;
  phone: string;
  station_id: string | null;
  station_name: string | null;
  credential_email: string | null;
  fullAddress: string | null;
  dob: string | null;
  gender: string;
  join_date: string | null;
  license_no: string;
  license_type: string;
  deposits: string;
  license_expiry: string | null;
  driving_exp: string;
  image: string | null;
  status: string;
}

interface StationOption {
  id: string;
  name: string;
}

interface PaginatedDriverResponse {
  data?:
    | Driver[]
    | {
        data?: Driver[];
        items?: Driver[];
      };
  items?: Driver[];
  stations?: StationOption[];
  meta?: {
    totalItems?: number;
    totalPages?: number;
    activeItems?: number;
    inactiveItems?: number;
    lastEditedBy?: string;
    total?: number;
    activeCount?: number;
    inactiveCount?: number;
  };
  total?: number;
  totalPages?: number;
  activeCount?: number;
  inactiveCount?: number;
  lastEditedBy?: string;
}

const PAGE_SIZE = 10;

export default function DriverListPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stations, setStations] = useState<StationOption[]>([]);

  // Pagination & Stats States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeRecords, setActiveRecords] = useState(0);
  const [inactiveRecords, setInactiveRecords] = useState(0);
  const [lastEditedBy, setLastEditedBy] = useState("Unknown");

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
    name: "",
  });

  // Active Filters State (Station filter ထပ်တိုးပါသည်)
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    search: "",
    startDate: "",
    endDate: "",
    stationId: "",
  });

  // Custom Hook for Filters
  const { filters, updateFilter, resetFilters } = useFilters(
    { search: "", startDate: "", endDate: "", stationId: "" },
    (debouncedFilters: FilterState) => {
      const isFilterChanged =
        activeFilters.search !== debouncedFilters.search ||
        activeFilters.startDate !== debouncedFilters.startDate ||
        activeFilters.endDate !== debouncedFilters.endDate ||
        activeFilters.stationId !== debouncedFilters.stationId;

      setActiveFilters(debouncedFilters);

      if (isFilterChanged) {
        setCurrentPage(1);
      }
    },
  );

  const fetchDrivers = async () => {
    try {
      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: PAGE_SIZE.toString(),
      };

      if (activeFilters.search) params.search = String(activeFilters.search);
      if (activeFilters.startDate)
        params.fromDate = String(activeFilters.startDate);
      if (activeFilters.endDate) params.toDate = String(activeFilters.endDate);
      if (activeFilters.stationId && activeFilters.stationId !== "all") {
        params.station_id = String(activeFilters.stationId);
      }

      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(
        `master-company/driver?${queryString}`,
      );

      const res = response as unknown as PaginatedDriverResponse;

      let driverList: Driver[] = [];
      let total = 0;
      let pages = 1;

      // Parse Data
      if (Array.isArray(res.items)) {
        driverList = res.items;
      } else if (Array.isArray(res.data)) {
        driverList = res.data;
      } else if (
        res.data &&
        typeof res.data === "object" &&
        Array.isArray(res.data.items)
      ) {
        driverList = res.data.items;
      } else if (
        res.data &&
        typeof res.data === "object" &&
        Array.isArray(res.data.data)
      ) {
        driverList = res.data.data;
      }

      // Parse Meta
      const meta = res.meta || (res as Record<string, unknown>);
      total = Number(meta.totalItems || meta.total || 0);
      pages = Number(meta.totalPages || 1);

      setDrivers(driverList);
      setTotalRecords(total);
      setTotalPages(pages);
      setActiveRecords(Number(meta.activeItems || meta.activeCount || 0));
      setInactiveRecords(Number(meta.inactiveItems || meta.inactiveCount || 0));
      setLastEditedBy(String(meta.lastEditedBy || "Unknown"));

      // Stations များကိုပါ တစ်ခါတည်းယူထားပါသည်
      if (res.stations && Array.isArray(res.stations)) {
        setStations(res.stations);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setDrivers([]);
    }
  };

  useEffect(() => {
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeFilters]);

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const handleDeleteSuccess = (id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  };

  const columns = [
    {
      header: "Driver Info",
      key: "driverInfo",
      render: (driver: Driver) => {
        const defaultImage = "/default-user.png";
        const src = driver.image
          ? driver.image.startsWith("http")
            ? driver.image
            : `http://localhost:3001${driver.image}`
          : defaultImage;

        return (
          <div className={styles.info}>
            {driver.image ? (
              <Image
                src={driver.image}
                alt={driver.driver_name}
                width={40}
                height={40}
                className={styles.image}
                unoptimized
              />
            ) : (
              <div className={styles.defaultImage}>
                <FontAwesomeIcon icon={faUser} />
              </div>
            )}
            <div>
              <div className={styles.textBold}>{driver.driver_name}</div>

              <div className={[styles.textSmall, styles.textMuted].join(" ")}>
                <span className={styles.textBold}>Phone : </span>
                {driver.phone || "-"}
              </div>

              <div
                className={
                  driver.status === "Active"
                    ? [styles.textSmall, styles.textSuccess].join(" ")
                    : [styles.textSmall, styles.textDanger].join(" ")
                }
              >
                {driver.status || "Unknown"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Identity",
      key: "identity",
      render: (driver: Driver) => (
        <div>
          <div className={styles.textBold}>NRC : {driver.nrc || "-"}</div>

          <div className={[styles.textSmall, styles.textInfo].join(" ")}>
            <span className={styles.textBold}>Email : </span>
            {driver.credential_email || "-"}
          </div>

          <div className={[styles.textSmall, styles.textMuted].join(" ")}>
            <span className={styles.textBold}>Gender : </span>
            {driver.gender || "-"}
          </div>
        </div>
      ),
    },
    {
      header: "License Info",
      key: "licenseInfo",
      render: (driver: Driver) => (
        <div>
          <div className={styles.textSmall}>
            <span className={styles.textBold}>No : </span>
            {driver.license_no || "-"}
          </div>

          <div className={styles.textSmall}>
            <span className={styles.textBold}>Type : </span>
            {driver.license_type || "-"}
          </div>

          <div className={styles.textSmall}>
            <span className={styles.textBold}>Join Date : </span>
            {driver.join_date || "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Start & Deposit",
      key: "deposit",
      render: (driver: Driver) => (
        <div>
          <div className={styles.textSmall}>
            <span className={styles.textBold}>Join Date : </span>
            {driver.join_date || "-"}
          </div>

          <div className={styles.textSmall}>
            <span className={styles.textBold}>Deposit : </span>
            {driver.deposits || "-"} MMK
          </div>
        </div>
      ),
    },
    {
      header: "Experience & Base",
      key: "assignment",
      render: (driver: Driver) => (
        <div>
          <div className={styles.textBold}>
            {driver.station_name || "Unassigned"}
          </div>

          <div className={[styles.textSmall, styles.textMuted].join(" ")}>
            <span className={styles.textBold}>Exp : </span>
            {driver.driving_exp || "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Contact Location",
      key: "address",
      render: (driver: Driver) => (
        <div className={styles.textSmall}>{driver.fullAddress || "-"}</div>
      ),
    },
    {
      header: "Timeline",
      key: "timeline",
      render: (driver: Driver) => (
        <div>
          <div>
            <span className={styles.textBold}>DOB : </span>
            {driver.dob ? String(driver.dob).split("T")[0] : "-"}
          </div>
          <div className={[styles.textDanger, styles.textSmall].join(" ")}>
            <span className={styles.textBold}>Exp : </span>
            {driver.license_expiry
              ? String(driver.license_expiry).split("T")[0]
              : "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (driver: Driver) => (
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            openDeleteModal(driver.id, driver.driver_name);
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
              <p className={styles.gridBoxTitle}>Driver Search</p>
              <hr className={styles.cuttingLine} />

              <div className={styles.searchContainer}>
                <TextInput
                  label="Searching"
                  placeholder="Search by name, NRC, phone..."
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

                <div className={styles.filterRow}>
                  <DropdownInput
                    label="Station"
                    options={stations.map((s, idx) => ({
                      id: s.id || `station-${idx}`,
                      name: s.name || "Unknown Station",
                    }))}
                    valueKey="id"
                    nameKey="name"
                    value={String(filters.stationId || "")}
                    onChange={(e) => updateFilter("stationId", e.target.value)}
                    placeholder="All Stations"
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
                <p className={styles.textBold}>RECENT RECORD</p>
                <span />

                <div className={styles.stat}>
                  <div>
                    <p
                      className={[styles.textBold, styles.textMuted].join(" ")}
                    >
                      Total Driver :
                    </p>
                    <p className={styles.textDanger}>{totalRecords}</p>
                  </div>
                  <div>
                    <p
                      className={[styles.textBold, styles.textMuted].join(" ")}
                    >
                      Active Driver :
                    </p>
                    <p className={styles.textSuccess}>{activeRecords}</p>
                  </div>
                  <div>
                    <p
                      className={[styles.textBold, styles.textMuted].join(" ")}
                    >
                      Inactive Driver :
                    </p>
                    <p className={styles.textDanger}>{inactiveRecords}</p>
                  </div>
                </div>
              </div>

              <hr className={styles.cuttingLine} />
              <p className={styles.lastEdited}>
                Last Edited : <span>{lastEditedBy}</span>
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
            <p className={styles.tableTitle}>DRIVER MASTER RECORDS</p>

            <div className={styles.headerActionArea}>
              <NavigationBtn href="/driver/Adddriver" leftIcon={faPlus}>
                Add Driver
              </NavigationBtn>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={drivers}
            onRowClick={(driver) =>
              router.push(`/driver/Updatedriver/${driver.id}`)
            }
            emptyMessage="No driver records found."
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
          name="Driver"
          id={deleteModal.id}
          apiRoute="master-company/driver"
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
