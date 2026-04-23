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

interface Vehicle {
  id: string;
  vehicle_name: string;
  station_name?: string;
  group_name?: string;
  vehicle_model_name?: string;
  license_plate?: string;
  color?: string;
  status: string;
  image?: string;
  city_taxi_no?: string;
  serial_no?: string;
  vin_no?: string;
  engine_no?: string;
  license_type?: string;
  vehicle_license_exp?: string;
  service_intervals?: string | number;
  current_odometer?: string;
  purchase_date?: string;
}

interface StationOption {
  id: string;
  station_name?: string;
  name?: string;
}

interface GroupOption {
  id: string;
  group_name?: string;
  name?: string;
}

interface VehicleModelOption {
  id: string;
  name?: string;
  vehicle_model_name?: string;
}

interface PaginatedVehicleResponse {
  data?:
    | Vehicle[]
    | {
        data?: Vehicle[];
        items?: Vehicle[];
        total?: number;
        totalPages?: number;
        activeCount?: number;
        inactiveCount?: number;
        lastEditedBy?: string;
      };
  items?: Vehicle[];
  total?: number;
  totalPages?: number;
  activeCount?: number;
  inactiveCount?: number;
  lastEditedBy?: string;
}

export default function VehicleListPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastEditedBy, setLastEditedBy] = useState("Unknown");
  const [activeRecords, setActiveRecords] = useState(0);
  const [inactiveRecords, setInactiveRecords] = useState(0);

  const [stations, setStations] = useState<StationOption[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModelOption[]>([]);

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
    groupId: "",
    stationId: "",
    vehicleModelId: "",
  });

  const { filters, updateFilter, resetFilters } = useFilters(
    {
      search: "",
      startDate: "",
      endDate: "",
      groupId: "",
      stationId: "",
      vehicleModelId: "",
    },
    (debouncedFilters: FilterState) => {
      const isFilterChanged =
        activeFilters.search !== debouncedFilters.search ||
        activeFilters.startDate !== debouncedFilters.startDate ||
        activeFilters.endDate !== debouncedFilters.endDate ||
        activeFilters.groupId !== debouncedFilters.groupId ||
        activeFilters.stationId !== debouncedFilters.stationId ||
        activeFilters.vehicleModelId !== debouncedFilters.vehicleModelId;

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
        };

        if (activeFilters.search) params.search = String(activeFilters.search);
        if (activeFilters.startDate)
          params.startDate = String(activeFilters.startDate);
        if (activeFilters.endDate)
          params.endDate = String(activeFilters.endDate);

        if (activeFilters.groupId && activeFilters.groupId !== "all") {
          params.group_id = String(activeFilters.groupId);
        }
        if (activeFilters.stationId && activeFilters.stationId !== "all") {
          params.station_id = String(activeFilters.stationId);
        }
        if (
          activeFilters.vehicleModelId &&
          activeFilters.vehicleModelId !== "all"
        ) {
          params.vehicle_model_id = String(activeFilters.vehicleModelId);
        }

        const queryString = new URLSearchParams(params).toString();
        const response = await apiClient.get(
          `/master-vehicle/vehicles?${queryString}`,
        );
        const res = response as unknown as PaginatedVehicleResponse;

        let dataList: Vehicle[] = [];
        let metaInfo: Partial<PaginatedVehicleResponse> = res;

        if (Array.isArray(res.data)) {
          // res.data က Array တန်းဖြစ်နေလျှင်
          dataList = res.data;
        } else if (res.data && typeof res.data === "object") {
          dataList = res.data.items || res.data.data || [];
          metaInfo = res.data;
        } else if (Array.isArray(res.items)) {
          dataList = res.items;
        } else {
          dataList = Array.isArray(res) ? res : [];
        }

        if (dataList.length > 0 || Array.isArray(dataList)) {
          setVehicles(dataList);

          setTotalRecords(metaInfo?.total || 0);
          setTotalPages(metaInfo?.totalPages || 1);
          setActiveRecords(metaInfo?.activeCount || 0);
          setInactiveRecords(metaInfo?.inactiveCount || 0);
          setLastEditedBy(metaInfo?.lastEditedBy || "Unknown");
        } else {
          setVehicles([]);
          setTotalRecords(0);
        }
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
        setVehicles([]);
      }
    };
    fetchData();
  }, [currentPage, activeFilters]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [stationsResponse, groupsResponse, vehicleModelsResponse] =
          await Promise.all([
            apiClient.get("/master-company/stations"),
            apiClient.get("/master-company/groups"),
            apiClient.get("/master-vehicle/vehicle-models"),
          ]);

        const extractData = <T,>(res: unknown): T[] => {
          if (!res) return [];
          if (Array.isArray(res)) return res as T[];

          const resObj = res as Record<string, unknown>;

          if (Array.isArray(resObj.items)) return resObj.items as T[];
          if (Array.isArray(resObj.data)) return resObj.data as T[];

          if (resObj.data && typeof resObj.data === "object") {
            const nestedData = resObj.data as Record<string, unknown>;
            if (Array.isArray(nestedData.items)) return nestedData.items as T[];
            if (Array.isArray(nestedData.data)) return nestedData.data as T[];
          }

          return [];
        };

        setStations(extractData<StationOption>(stationsResponse));
        setGroups(extractData<GroupOption>(groupsResponse));
        setVehicleModels(
          extractData<VehicleModelOption>(vehicleModelsResponse),
        );
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };
    fetchFilters();
  }, []);

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      name,
    });
  };

  const handleDeleteSuccess = (id: string) => {
    setVehicles((prevData) => prevData.filter((row) => row.id !== id));
  };

  const columns = [
    {
      header: "Vehicle Info",
      key: "vehicleInfo",
      render: (vehicle: Vehicle) => (
        <div className={styles.vehicleInfo}>
          {vehicle.image ? (
            <Image
              src={vehicle.image || "/default-user.png"}
              alt={vehicle.vehicle_name}
              width={40}
              height={40}
              unoptimized
              className={styles.vehicleImg}
            />
          ) : (
            <div className={styles.placeholderLogo}>
              <FontAwesomeIcon icon={faCar} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: "600" }}> {vehicle.vehicle_name}</div>
            <div style={{ fontSize: "11px", color: "#666" }}>
              <b>Plate : </b>
              {vehicle.license_plate || "-"}
            </div>

            <div
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                color:
                  vehicle.status === "Active"
                    ? "var(--success)"
                    : "var(--danger)",
                marginTop: "2px",
              }}
            >
              {vehicle.status || "Unknown"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Identifiers",
      key: "identifiers",
      render: (vehicle: Vehicle) => (
        <div>
          <div style={{ fontWeight: "500" }}>
            <b>VIN : </b>
            {vehicle.vin_no || "-"}
          </div>
          <div style={{ fontSize: "12px", color: "#007bff" }}>
            <b>ENG : </b>
            {vehicle.engine_no || "-"}
          </div>

          <div style={{ fontSize: "12px" }}>
            <b>Serial : </b>
            {vehicle.serial_no || "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Vehicle Identifiers",
      key: "vehicleIdentifiers",
      render: (vehicle: Vehicle) => (
        <div>
          <div style={{ fontSize: "12px" }}>
            <b>CITY TAXI : </b>
            {vehicle.city_taxi_no || "-"}
          </div>
          <div style={{ fontSize: "12px" }}>
            <b>Type : </b>
            {vehicle.license_type || "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Specifications",
      key: "specs",
      render: (vehicle: Vehicle) => (
        <div>
          <div style={{ fontWeight: "500" }}>
            <b>Model : </b>
            {vehicle.vehicle_model_name || "-"}
          </div>
          <div style={{ fontSize: "12px", color: "gray" }}>
            <b>Color : </b>
            {vehicle.color || "-"}
          </div>
        </div>
      ),
    },

    {
      header: "Maintenance",
      key: "maintenance",
      render: (vehicle: Vehicle) => (
        <div>
          <div style={{ fontWeight: "500" }}>
            <b>Odo : </b>
            {vehicle.current_odometer ? `${vehicle.current_odometer} km` : "-"}
          </div>
          <div style={{ fontSize: "12px", color: "gray" }}>
            <b>Service : </b>
            {vehicle.service_intervals
              ? String(vehicle.service_intervals).split("T")[0]
              : "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Assignment",
      key: "assignment",
      render: (vehicle: Vehicle) => (
        <div>
          <div style={{ fontWeight: "500" }}>
            {vehicle.station_name || "Unassigned"}
          </div>
          <div style={{ fontSize: "12px", color: "gray" }}>
            <b>Group : </b>
            {vehicle.group_name || "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Timeline",
      key: "timeline",
      render: (vehicle: Vehicle) => (
        <div>
          <div className={styles.timelineText}>
            <b>Purchased : </b>
            {vehicle.purchase_date
              ? String(vehicle.purchase_date).split("T")[0]
              : "-"}
          </div>
          <div className={styles.expireText}>
            <b>Exp : </b>
            {vehicle.vehicle_license_exp
              ? String(vehicle.vehicle_license_exp).split("T")[0]
              : "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (vehicle: Vehicle) => (
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            openDeleteModal(vehicle.id, vehicle.vehicle_name);
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
              <p className={styles.gridBoxTitle}>Vehicle Search</p>
              <hr className={styles.cuttingLine} />

              <div className={styles.searchContainer}>
                <TextInput
                  label="Searching"
                  placeholder="Search by name, taxi no..."
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
                  {/* 🛑 Data အလွတ်ပေါ်ခြင်း နှင့် Duplicate Key ပြဿနာ ဖြေရှင်းချက် */}
                  <DropdownInput
                    label="Vehicle Model"
                    options={vehicleModels.map((v, idx) => ({
                      id: v.id || `model-${idx}`,
                      name: v.vehicle_model_name || v.name || "Unknown Model",
                    }))}
                    valueKey="id"
                    nameKey="name"
                    value={String(filters.vehicleModelId || "")}
                    onChange={(e) =>
                      updateFilter("vehicleModelId", e.target.value)
                    }
                    placeholder="All Models"
                  />

                  <DropdownInput
                    label="Station"
                    options={stations.map((s, idx) => ({
                      id: s.id || `station-${idx}`,
                      name: s.station_name || s.name || "Unknown Station",
                    }))}
                    valueKey="id"
                    nameKey="name"
                    value={String(filters.stationId || "")}
                    onChange={(e) => updateFilter("stationId", e.target.value)}
                    placeholder="All Stations"
                  />

                  <DropdownInput
                    label="Group"
                    options={groups.map((g, idx) => ({
                      id: g.id || `group-${idx}`,
                      name: g.group_name || g.name || "Unknown Group",
                    }))}
                    valueKey="id"
                    nameKey="name"
                    value={String(filters.groupId || "")}
                    onChange={(e) => updateFilter("groupId", e.target.value)}
                    placeholder="All Groups"
                  />
                </div>

                <div style={{ alignSelf: "flex-start" }}>
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
                    <p className={styles.statLable}>Total Vehicle :</p>
                    <p className={styles.textDanger}>{totalRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLable}>Active Vehicle :</p>
                    <p className={styles.textSuccess}>{activeRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLable}>Inactive Vehicle :</p>
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
            <p className={styles.tableTitle}>Vehicle MASTER RECORDS</p>

            <div className={styles.headerActionArea}>
              <NavigationBtn href="/vehicle/Addvehicle" leftIcon={faPlus}>
                Add Vehicle
              </NavigationBtn>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={vehicles}
            onRowClick={(vehicle) =>
              router.push(`/vehicle/Updatevehicle/${vehicle.id}`)
            }
            emptyMessage="No vehicle records found."
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
          name="Vehicle"
          id={deleteModal.id}
          apiRoute="master-vehicle/vehicles"
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
