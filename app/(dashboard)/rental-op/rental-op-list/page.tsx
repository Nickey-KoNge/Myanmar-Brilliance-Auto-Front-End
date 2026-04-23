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
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import DeleteModal from "@/app/components/ui/Delete/DeleteModal";


interface TripFinance {
  rental_amount: string;
  overtime_amount: string;
  refund_amount: string;
  total: string;
  payment_status: string;
}

interface AssignmentRecord {
  id: string;
  driver_id: string;
  driver_name: string;
  driver_image_url: string;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_image_url: string; 
  plate_number: string | null; 
  start_odo: string; 
  station_name: string;
  branch_name: string;
  trip_status: string; 
  status: string; 
  created_at: string; 
  route_name: string;
}

interface PaginatedResponse {
  success: boolean;
  data: {
    items: AssignmentRecord[];
    meta: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      itemsPerPage: number;
    };
  };
}

export default function AssignmentListPage() {
  const router = useRouter();
  const [records, setRecords] = useState<AssignmentRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [activeRecords, setActiveRecords] = useState(0);
  const [inactiveRecords, setInactiveRecords] = useState(0);
  const [lastEditedBy, setLastEditedBy] = useState("Unknown");
  
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

  const { filters, updateFilter, resetFilters } = useFilters(
    { search: "", startDate: "", endDate: "" },
    (debouncedFilters: FilterState) => {
      setCurrentPage(1);
    }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: PAGE_SIZE.toString(),
          ...(filters.search && { search: String(filters.search) }),
          ...(filters.startDate && { startDate: String(filters.startDate) }),
          ...(filters.endDate && { endDate: String(filters.endDate) }),
        });

        const response = await apiClient.get(`/master-rental/rental-operation?${params.toString()}`);
        const res = response as unknown as PaginatedResponse;

      
          const items = res.items || [];
          const meta = res.meta;

          setRecords(items);
          setTotalRecords(meta.totalItems);
          setTotalPages(meta.totalPages);

        
          setActiveRecords(items.filter(r => r.trip_status === "Ongoing").length);
          setInactiveRecords(items.filter(r => r.trip_status === "Completed").length);
        

        console.log("API Response:", res?.items || []);
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
      <div className={styles.vehicleInfo}>
        <Image
          src={row.driver_image_url || "/placeholder.png"}
          alt={row.driver_name}
          width={40}
          height={40}
          unoptimized
          className={styles.vehicleImg}
        />
        <div>
          <div style={{ fontWeight: "600" }}>{row.driver_name}</div>
          <div style={{
            fontSize: "10px",
            fontWeight: "bold",
            color: row.trip_status === "Ongoing" ? "var(--success)" : 
                   row.trip_status === "Pending" ? "#ffc107" : "var(--danger)"
          }}>
           {row.trip_status.toUpperCase()}
          </div>
        </div>
      </div>
    ),
  },
  {
    header: "Vehicle & Battery",
    key: "vehicleDetails",
    render: (row: any) => (
      <div>
        <div style={{ fontWeight: "500" }}>{row.vehicle_name}</div>
        <div style={{ fontSize: "11px", color: "#666" }}>
          <b>Plate:</b> {row.plate_number || "N/A"}
        </div>
        <div style={{ fontSize: "11px", color: "var(--primary-color)" }}>
          <b>Battery:</b> {row.start_battery}% → {row.end_battery || "--"}%
        </div>
      </div>
    ),
  },
  {
    header: "Route & Power",
    key: "routePower",
    render: (row: any) => (
      <div>
        <div style={{ fontSize: "12px" }}><b>Route:</b> {row.route_name}</div>
        <div style={{ fontSize: "12px" }}><b>Station:</b> {row.power_station_name || "-"}</div>
        <div style={{ fontSize: "11px", fontStyle: "italic" }}>{row.description || ""}</div>
      </div>
    ),
  },
  {
    header: "Odometer & Stats",
    key: "odoStats",
    render: (row: any) => (
      <div style={{ fontSize: "12px" }}>
        <div><b>Odo:</b> {isNaN(Number(row.start_odo)) ? "0" : row.start_odo} → {row.end_odo || "--"}</div>
        <div><b>Extra Hr:</b> {row.extra_hours || "0"}</div>
        <div><b>Distance:</b> {row.distance || "0"} km</div>
      </div>
    ),
  },
  {
    header: "Station/Branch",
    key: "location",
    render: (row: AssignmentRecord) => (
      <div>
        <div style={{ fontWeight: "500" }}>{row.station_name}</div>
        <div style={{ fontSize: "12px", color: "gray" }}>{row.branch_name}</div>
      </div>
    ),
  },
  {
    header: "Finance",
    key: "finance",
    render: (row: any) => {
      const finance = row.trip_finances?.[0];
      return (
        <div>
          <div style={{ fontWeight: "600" }}>
            {finance ? `${Number(finance.total).toLocaleString()} USD` : "0.00"}
          </div>
          <div style={{ 
            fontSize: "11px", 
            color: finance?.payment_status === "Pending" ? "#e67e22" : "#27ae60" 
          }}>
            {finance?.payment_status || "No Data"}
          </div>
        </div>
      );
    }
  },
  {
    header: "Timeline",
    key: "timeline",
    render: (row: AssignmentRecord) => (
      <div>
        <div style={{ fontSize: "12px" }}>{row.created_at?.split("T")[0]}</div>
        <div style={{ fontSize: "11px", color: "#888" }}>
          {row.created_at?.split("T")[1].substring(0, 5)}
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
                <div style={{ alignSelf: "flex-start" }}>
                  <ActionBtn variant="action" fullWidth={false} onClick={resetFilters}>
                    reset
                  </ActionBtn>
                </div>
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
                    <p className={styles.statLable}>Total Trips :</p>
                    <p className={styles.textDanger}>{totalRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLable}>Active Routes :</p>
                    <p className={styles.textSuccess}>{activeRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLable}>Inactive Routes :</p>
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
              <NavigationBtn href="/vehicle-driver-assign" leftIcon={faPlus}>
                Add Assignment
              </NavigationBtn>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={records}
            onRowClick={(row) => router.push(`/vehicle/Assignment/Update/${row.id}`)}
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
          apiRoute="master-rental/rental-operation"
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}