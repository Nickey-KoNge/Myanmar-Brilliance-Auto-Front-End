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
  // faUser,
} from "@fortawesome/free-solid-svg-icons";

// Components
// import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
//pagination components
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
// Styles
import styles from "./page.module.css";

import { apiClient } from "@/app/features/lib/api-client";
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";
// import DropdownInput from "@/app/components/ui/SearchBoxes/DropdownInput";

// Hook
import { useFilters, FilterState } from "@/app/hooks/userFilters";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import DeleteModal from "@/app/components/ui/Delete/DeleteModal";
interface VehicleBrand {
  id: string;
  vehicle_brand_name: string;
  country_of_origin: string;
  manufacturer: string;
  image: string;
  description: string;
  status: string;
}

export default function VehicleBrandsPage() {
  const router = useRouter();

  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
    name: "",
  });

  //for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeRecords, setActiveRecords] = useState(0);
  const [inactiveRecords, setInactiveRecords] = useState(0);
  const [lastEditedBy, setLastEditedBy] = useState("Unknown");
  const PAGE_SIZE = 10;

  //Active Filters State
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    search: "",
    startDate: "",
    endDate: "",
    branchId: "",
    roleId: "",
  });

  // Custom Hook
  const { filters, updateFilter, resetFilters } = useFilters(
    { search: "", startDate: "", endDate: "", branchId: "", roleId: "" },
    (debouncedFilters) => {
      const isFilterChanged =
        activeFilters.search !== debouncedFilters.search ||
        activeFilters.startDate !== debouncedFilters.startDate ||
        activeFilters.endDate !== debouncedFilters.endDate ||
        activeFilters.branchId !== debouncedFilters.branchId ||
        activeFilters.roleId !== debouncedFilters.roleId;

      setActiveFilters(debouncedFilters);

      if (isFilterChanged) {
        setCurrentPage(1);
      }
    },
  );

  // fetch Vehicle Brand Data
  useEffect(() => {
    const fetchVehicleBrands = async () => {
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
          `/master-vehicle/vehicle-brands?${queryString}`,
        );

        const res = response as unknown as {
          data?:
            | VehicleBrand[]
            | {
                data?: VehicleBrand[];
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

        let vehicleBrandList: VehicleBrand[] = [];
        let total = 0;
        let totalPages = 1;

        if (res && typeof res === "object") {
          console.log(res.data);
          if (Array.isArray(res.data)) {
            vehicleBrandList = res.data;
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
            vehicleBrandList = res.data.data;
            total = res.data.total || 0;
            totalPages = res.data.totalPages || 1;
          }
        }

        setVehicleBrands(vehicleBrandList);
        setTotalRecords(total);
        setTotalPages(totalPages);
      } catch (error) {
        console.error("Failed to fetch vehicle brands:", error);
        setVehicleBrands([]);
      }
    };
    fetchVehicleBrands();
  }, [currentPage, activeFilters]);

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      name,
    });
  };
  const handleDeleteSuccess = (id: string) => {
    setVehicleBrands((prev) => prev.filter((v) => v.id !== id));
  };
  const columns = [
    {
      header: "Vehicle Brand Info",
      key: "vehicle_brand_name",
      render: (vehicleBrand: VehicleBrand) => (
        <div className={styles.vehiclebrandnfo}>
          <Image
            src={vehicleBrand.image || "/default-user.png"}
            alt={vehicleBrand.vehicle_brand_name}
            width={40}
            height={40}
            unoptimized
            className={styles.vehiclebrandImg}
          />
          {vehicleBrand.vehicle_brand_name}
        </div>
      ),
    },
    { header: "Country", key: "country_of_origin" },
    { header: "Manufacturer", key: "manufacturer" },
    { header: "Description", key: "description" },
    {
      header: "Actions",
      key: "actions",
      render: (vehicleBrand: VehicleBrand) => (
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            openDeleteModal(vehicleBrand.id, vehicleBrand.vehicle_brand_name);
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
              <p className={styles.gridBoxTitle}>Vehicle Brand Search</p>
              <hr className={styles.cuttingLine} />

              <div className={styles.searchContainer}>
                <TextInput
                  label="Searching"
                  placeholder="Search by brand, manufacturer, country..."
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
                    <p className={styles.statLable}>Total Brands :</p>
                    <p className={styles.textDanger}>{totalRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLable}>Active Brands :</p>
                    <p className={styles.textSuccess}>{activeRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLable}>Inactive Brands :</p>
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
            <p className={styles.tableTitle}>VEHICLE BRANDS MASTER RECORDS</p>

            <div className={styles.headerActionArea}>
              <NavigationBtn
                href="/vehicle-brands/Addvehiclebrands"
                leftIcon={faPlus}
              >
                add brand
              </NavigationBtn>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={vehicleBrands}
            onRowClick={(vehicleBrand) =>
              router.push(
                `/vehicle-brands/Updatevehiclebrands/${vehicleBrand.id}`,
              )
            }
            emptyMessage="No vehicle brands record records found."
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
          name="vehicle-brand"
          id={deleteModal.id}
          apiRoute="master-vehicle/vehicle-brands"
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
