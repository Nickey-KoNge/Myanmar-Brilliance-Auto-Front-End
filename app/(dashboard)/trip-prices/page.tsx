"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/app/features/lib/api-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faClockRotateLeft,
  faPlus,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FilterState, useFilters } from "@/app/hooks/userFilters";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";

import styles from "./page.module.css";
import TextInput from "@/app/components/ui/Inputs/TextInput";
import DateInput from "@/app/components/ui/Inputs/DateInput";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import DeleteModal from "@/app/components/ui/Delete/DeleteModal";
import { TripFormData } from "./components/TripForm";

// Modals
import AddTripModal from "./AddTripModal";
import AddTripPriceModal from "../rental-op/AddTripPriceModal";

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

// Dropdown များအတွက် အတိအကျ Type သတ်မှတ်ခြင်း
interface RouteItem {
  id: string;
  route_name: string;
}

interface StationItem {
  id: string;
  station_name: string;
}

interface VehicleModelItem {
  id: string;
  vehicle_model_name: string;
}

// API မှ ပြန်လာနိုင်သော နာမည်အမျိုးမျိုးကို လက်ခံနိုင်ရန် Raw Type များ
interface RawRoute {
  id: string;
  route_name?: string;
  name?: string;
}

interface RawStation {
  id: string;
  station_name?: string;
  name?: string;
}

interface RawVehicleModel {
  id: string;
  vehicle_model_name?: string;
  model_name?: string;
  name?: string;
}

export default function TripPricePage() {
  const [vehicles, setVehicles] = useState<TripPrice[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [activeTripCount, setActiveTripCount] = useState(0);
  const [inactiveTripCount, setInactiveTripCount] = useState(0);

  // Modals States
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripPrice | null>(null);

  // Dropdown Data States
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [stations, setStations] = useState<StationItem[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModelItem[]>([]);

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

  // ဖြေရှင်းချက်: useFilters ထဲသို့ ပေးပို့မည့် Function အား Render တိုင်း အသစ်မဖြစ်စေရန် useCallback ဖြင့် ပတ်ထားပါသည်
  const handleFilterChange = useCallback((debouncedFilters: FilterState) => {
    setActiveFilters(debouncedFilters);
    setCurrentPage(1);
  }, []);

  const { filters, updateFilter, resetFilters } = useFilters(
    { search: "", startDate: "", endDate: "" },
    handleFilterChange,
  );

  const fetchData = useCallback(async () => {
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

      const activeCount =
        res.data?.filter((trip) => trip.status === "Active").length || 0;
      const inactiveCount =
        res.data?.filter((trip) => trip.status === "Inactive").length || 0;
      setActiveTripCount(activeCount);
      setInactiveTripCount(inactiveCount);
    } catch (err) {
      console.error(err);
      setVehicles([]);
    }
  }, [currentPage, activeFilters]);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [routesRes, stationsRes, modelsRes] = await Promise.all([
        apiClient.get("/master-trips/routes"),
        apiClient.get("/master-company/stations"),
        apiClient.get("/master-vehicle/vehicle-models?limit=1000"),
      ]);

      const getArray = <T,>(response: unknown): T[] => {
        const resObj = response as { data?: T[] | { data?: T[] }; items?: T[] };

        if (Array.isArray(resObj?.items)) return resObj.items;
        if (Array.isArray(resObj?.data)) return resObj.data as T[];
        if (
          resObj?.data &&
          typeof resObj.data === "object" &&
          "data" in resObj.data &&
          Array.isArray((resObj.data as { data: T[] }).data)
        ) {
          return (resObj.data as { data: T[] }).data;
        }
        if (Array.isArray(response)) return response as T[];
        return [];
      };

      const rData = getArray<RawRoute>(routesRes);
      const sData = getArray<RawStation>(stationsRes);
      const mData = getArray<RawVehicleModel>(modelsRes);

      setRoutes(
        rData.map((r) => ({
          id: r.id,
          route_name: r.route_name || r.name || "Unknown Route",
        })),
      );

      setStations(
        sData.map((s) => ({
          id: s.id,
          station_name: s.station_name || s.name || "Unknown Station",
        })),
      );

      setVehicleModels(
        mData.map((m) => ({
          id: m.id,
          vehicle_model_name:
            m.vehicle_model_name || m.model_name || m.name || "Unknown Model",
        })),
      );
    } catch (err) {
      console.error("Dropdown data ဆွဲထုတ်ရာတွင် အမှားရှိနေပါသည်", err);
    }
  }, []);

  useEffect(() => {
    const runFetch = async () => {
      await fetchData();
    };
    runFetch();
  }, [fetchData]);

  useEffect(() => {
    const runDropdownFetch = async () => {
      await fetchDropdownData();
    };
    runDropdownFetch();
  }, [fetchDropdownData]);

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const handleDeleteSuccess = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const handleAddTrip = () => {
    setIsBulkModalOpen(true);
  };

  const handleRowClick = (item: TripPrice) => {
    setSelectedTrip(item);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateTrip = async (data: TripFormData) => {
    try {
      if (selectedTrip) {
        await apiClient.patch(`/master-trips/trip-prices/${selectedTrip.id}`, {
          route_id: data.route_id,
          vehicle_model_id: data.vehicle_model_id,
          station_id: data.station_id,
          daily_trip_rate: data.daily_trip_rate,
          overnight_trip_rate: data.overnight_trip_rate,
          status: data.status,
        });

        setIsUpdateModalOpen(false);
        setSelectedTrip(null);
        await fetchData();
      }
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
                    <p className={styles.statLabel}>Active Trips :</p>
                    <p className={styles.textSuccess}>{activeTripCount}</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Inactive Trips :</p>
                    <p className={styles.textDanger}>{inactiveTripCount}</p>
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
            onRowClick={handleRowClick}
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

      {/* အသစ်ထည့်ရန် (Bulk Create Modal) */}
      {isBulkModalOpen && (
        <AddTripPriceModal
          routesList={routes}
          stationsList={stations}
          vehicleModelsList={vehicleModels}
          onClose={() => setIsBulkModalOpen(false)}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}

      {/* ပြင်ဆင်ရန် (Update Single Modal) */}
      <AddTripModal
        open={isUpdateModalOpen}
        mode="update"
        initialData={selectedTrip || undefined}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedTrip(null);
        }}
        onSubmit={handleUpdateTrip}
      />
    </>
  );
}
