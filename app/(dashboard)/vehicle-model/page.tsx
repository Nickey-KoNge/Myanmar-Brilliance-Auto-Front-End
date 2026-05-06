"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faClockRotateLeft,
  faFilter,
  faFilterCircleXmark,
  faPlus,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

// UI Components
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import TextInput from "@/app/components/ui/Inputs/TextInput";
import DateInput from "@/app/components/ui/Inputs/DateInput";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import DeleteModal from "@/app/components/ui/Delete/DeleteModal";

import { apiClient } from "@/app/features/lib/api-client";
import { FilterState, useFilters } from "@/app/hooks/userFilters";
import styles from "./page.module.css";

interface VehicleModel {
  id: string;
  vehicle_model_name: string;
  vehicle_brand_id: string;
  vehicle_brand_name?: string;
  body_type?: string;
  fuel_type?: string;
  transmission?: string;
  engine_capacity?: string;
  status: string;
}

interface VehicleBrand {
  id: string;
  name: string;
}

interface PaginatedModelResponse {
  items?: VehicleModel[];
  brands?: VehicleBrand[];
  meta?: {
    totalItems: number;
    totalPages: number;
    activeItems?: number;
    inactiveItems?: number;
    lastEditedBy?: string;
  };

  data?: {
    items?: VehicleModel[];
    brands?: VehicleBrand[];
    meta?: {
      totalItems: number;
      totalPages: number;
      activeItems?: number;
      inactiveItems?: number;
      lastEditedBy?: string;
    };
  };
}

export default function VehicleModelListPage() {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [modelsData, setModelsData] = useState<VehicleModel[]>([]);

  const [activeRecords, setActiveRecords] = useState(0);
  const [inactiveRecords, setInactiveRecords] = useState(0);
  const [lastEditedBy, setLastEditedBy] = useState("Unknown");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
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
      header: "Model Name",
      key: "vehicle_model_name",
      render: (model: VehicleModel) => (
        <span className={styles.textBold}>{model.vehicle_model_name}</span>
      ),
    },
    {
      header: "Brand",
      key: "vehicle_brand_name",
    },
    {
      header: "Body Type",
      key: "body_type",
    },
    {
      header: "Fuel Type",
      key: "fuel_type",
    },
    {
      header: "Transmission",
      key: "transmission",
    },
    {
      header: "Engine",
      key: "engine_capacity",
    },
    {
      header: "Status",
      key: "status",
      render: (model: VehicleModel) => (
        <span
          className={[
            styles.textBold,
            model.status === "Active" ? styles.textSuccess : styles.textDanger,
          ].join(" ")}
        >
          {model.status}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (model: VehicleModel) => (
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();

            openDeleteModal(model.id, model.vehicle_model_name);
          }}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      ),
    },
  ];

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

        const queryString = new URLSearchParams(params).toString();
        const response = await apiClient.get(
          `master-vehicle/vehicle-models?${queryString}`,
        );

        const res = response as unknown as PaginatedModelResponse;

        const resData = res || res;
        console.log("API Response Data:", resData);

        if (resData && resData.items) {
          // Map brand names to models
          const mappedItems = resData.items.map((item) => {
            const brand = resData.brands?.find(
              (b) => b.id === item.vehicle_brand_id,
            );
            return {
              ...item,
              vehicle_brand_name: brand ? brand.name : "N/A",
            };
          });

          setModelsData(mappedItems);
          setTotalPages(resData.meta?.totalPages || 1);
          setTotalRecords(resData.meta?.totalItems || 0);
          setActiveRecords(resData.meta?.activeItems || 0);
          setInactiveRecords(resData.meta?.inactiveItems || 0);
          setLastEditedBy(resData.meta?.lastEditedBy || "Unknown");
        } else {
          setModelsData([]);
          setTotalRecords(0);
        }
      } catch (err) {
        console.error("Failed to fetch vehicle models:", err);
        setModelsData([]);
      }
    };

    fetchData();
  }, [currentPage, activeFilters]);
  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      name,
    });
  };
  const handleDeleteSuccess = (id: string) => {
    setModelsData((prevData) => prevData.filter((row) => row.id !== id));
  };

  return (
    <>
      <PageGridLayout
        isSidebarOpen={isFilterOpen}
        sidebar={
          <div className={styles.sidebarWrapper}>
            <div className={styles.topSection}>
              <p className={styles.gridBoxTitle}>Model Search</p>
              <hr className={styles.cuttingLine} />
              <div className={styles.searchContainer}>
                <TextInput
                  label="SEARCH"
                  placeholder="Search model, brand..."
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
                    <p className={styles.statLabel}>Total Models :</p>
                    <p className={styles.textDanger}>{totalRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Active Models :</p>
                    <p className={styles.textSuccess}>{activeRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Inactive Models :</p>
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
            <p className={styles.tableTitle}>VEHICLE MODELs MASTER RECORDS</p>

            <div className={styles.headerActionArea}>
              <ActionBtn
                leftIcon={isFilterOpen ? faFilterCircleXmark : faFilter}
                variant="info"
                onClick={() => setIsFilterOpen((prev) => !prev)}
              />
              <NavigationBtn
                href="/vehicle-model/Addvehiclemodel"
                leftIcon={faPlus}
              >
                add model
              </NavigationBtn>
            </div>
          </div>

          <div className={styles.tableBody}>
            <DataTable
              data={modelsData}
              columns={columns}
              onRowClick={(model) =>
                router.push(`/vehicle-model/Updatevehiclemodel/${model.id}`)
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

      {deleteModal.isOpen && deleteModal.id && (
        <DeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
          itemName={deleteModal.name}
          name="Vehicle Model"
          id={deleteModal.id}
          apiRoute="master-vehicle/vehicle-models"
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
