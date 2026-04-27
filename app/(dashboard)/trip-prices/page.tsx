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
  faCar,
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
import { TripFormData } from "./components/TripForm";
import { set } from "react-hook-form";
import AddTripModal from "./AddTripModal";

interface TripPrice {
  id: string;
  route_name: string;
  start_location: string;
  end_location: string;
  daily_trip_rate: string;
  overnight_trip_rate: string;
  vehicle_model_name?: string;
  station_name?: string;
  station_phone?: string;
  status: string;
  created_at: string;
}

interface PaginatedResponse {
  data?: TripPrice[];
  total?: number;
  totalPages?: number;
}

export default function TripPricePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<TripPrice[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedTrip, setSelectedTrip] = useState<TripPrice | null>(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null as string | null,
    name: "",
  });

  const PAGE_SIZE = 10;

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    search: "",
    startDate: "",
    endDate: "",
  });

  const { filters, updateFilter, resetFilters } = useFilters(
    { search: "", startDate: "", endDate: "" },
    (debouncedFilters) => {
      setActiveFilters(debouncedFilters);
      setCurrentPage(1);
    },
  );

  const fetchData = async () => {
    try {
      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: PAGE_SIZE.toString(),
      };

      if (activeFilters.search) params.search = activeFilters.search;

      const query = new URLSearchParams(params).toString();

      const res = (await apiClient.get(
        `/master-trips/trip-prices?${query}`,
      )) as unknown as PaginatedResponse;

      const list = res?.data || [];

      setVehicles(list);
      setTotalRecords(res?.total || 0);
      setTotalPages(res?.totalPages || 1);

      console.log("Fetched Trip Prices:", list);
    } catch (err) {
      console.error(err);
      setVehicles([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, activeFilters]);

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const handleDeleteSuccess = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const handleAddTrip = () => {
    setModalMode("create");
    setSelectedTrip(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleSubmitTrip = async (data: TripFormData) => {
    try {
      if (modalMode === "create") {
        await apiClient.post(`/master-trips/trip-prices`, data);
      }

      if (modalMode === "update" && selectedTrip) {
        await apiClient.patch(`/master-trips/trip-prices/${selectedTrip.id}`, {
          route_id: data.route_id,
          vehicle_model_id: data.vehicle_model_id,
          station_id: data.station_id,
          daily_trip_rate: data.daily_trip_rate,
          overnight_trip_rate: data.overnight_trip_rate,
          status: data.status,
        });
      }

      setModalOpen(false);
      await fetchData();
      setSelectedTrip(null);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    {
      header: "Route Info",
      key: "routeInfo",
      render: (item: TripPrice) => (
        <div className={styles.info}>
          <div>
            <div className={styles.textBold}>{item.route_name}</div>

            <div className={[styles.textSmall, styles.textMuted].join(" ")}>
              <span className={styles.textBold}>Route : </span>
              {item.start_location} → {item.end_location}
            </div>

            <div
              className={[
                styles.textSmall,
                styles.textBold,
                item.status === "Active"
                  ? styles.textSuccess
                  : styles.textDanger,
              ].join(" ")}
            >
              {item.status}
            </div>
          </div>
        </div>
      ),
    },

    {
      header: "Prices",
      key: "prices",
      render: (item: TripPrice) => (
        <div>
          <div>
            <span className={styles.textBold}>Daily : </span>{" "}
            {item.daily_trip_rate}
          </div>
          <div>
            <span className={styles.textBold}>Overnight : </span>{" "}
            {item.overnight_trip_rate}
          </div>
        </div>
      ),
    },

    {
      header: "Vehicle Model",
      key: "model",
      render: (item: TripPrice) => <div>{item.vehicle_model_name || "-"}</div>,
    },

    {
      header: "Station",
      key: "Station",
      render: (item: TripPrice) => (
        <div>
          <div>{item.station_name || "Unassigned"}</div>
          <div>
            <span className={styles.textBold}>Phone : </span>{" "}
            {item.station_phone || "-"}
          </div>
        </div>
      ),
    },

    {
      header: "Timeline",
      key: "timeline",
      render: (item: TripPrice) => <div>{item.created_at?.split("T")[0]}</div>,
    },

    {
      header: "Actions",
      key: "actions",
      render: (item: TripPrice) => (
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            openDeleteModal(item.id, item.route_name);
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
              <p className={styles.gridBoxTitle}>Trip Price Search</p>
              <hr className={styles.cuttingLine} />

              <div className={styles.searchContainer}>
                <TextInput
                  label="Searching"
                  placeholder="Search route..."
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
                    <p className={styles.statLabel}>Total Trips :</p>
                    <p className={styles.textDanger}>{totalRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Active Routes :</p>
                    <p className={styles.textSuccess}>"N/A"</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Inactive Routes :</p>
                    <p className={styles.textDanger}>"N/A"</p>
                  </div>
                </div>
              </div>

              <hr className={styles.cuttingLine} />
              <p className={styles.lastEdited}>
                Last Edited : <span className={styles.spanText}>Unknown</span>
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
                showOnlyInfo
              />
            </div>

            <p className={styles.tableTitle}>TRIP PRICE RECORDS</p>

            <div className={styles.headerActionArea}>
              <NavigationBtn href="#" leftIcon={faPlus} onClick={handleAddTrip}>
                Add Trip Prices
              </NavigationBtn>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={vehicles}
            onRowClick={(item) => {
              setModalMode("update");
              setSelectedTrip(item);
              setModalOpen(true);
              {console.log("DEBUG", item)}
            }}

          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          showOnlyActions
        />
      </PageGridLayout>

      {deleteModal.isOpen && deleteModal.id && (
        <DeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
          itemName={deleteModal.name}
          name="Trip Price"
          id={deleteModal.id}
          apiRoute="master-trips/trip-prices"
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}

      <AddTripModal
        open={modalOpen}
        mode={modalMode}
        initialData={selectedTrip || undefined}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTrip}
      />
    </>
  );
}
