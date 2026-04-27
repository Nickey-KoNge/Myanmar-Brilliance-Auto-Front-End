"use client";

import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import { apiClient } from "@/app/features/lib/api-client";
import { FilterState, useFilters } from "@/app/hooks/userFilters";
import {
  faCalendarDays,
  faClockRotateLeft,
  faL,
  faPlus,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import TextInput from "@/app/components/ui/Inputs/TextInput";
import DateInput from "@/app/components/ui/Inputs/DateInput";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import DeleteModal from "@/app/components/ui/Delete/DeleteModal";
import AddRouteModal from "./AddRouteModal";

interface Route {
  id: string;
  route_name: string;
  start_location: string;
  end_location: string;
  status: string;
  created_at: string;
}

export interface RouteFormData {
  route_name: string;
  start_location: string;
  end_location: string;
}

export default function TripRoutesPage() {
  const router = useRouter();

  const [routeData, setRouteData] = useState<Route[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [activeRecords, setActiveRecords] = useState(0);
  const [inactiveRecords, setInactiveRecords] = useState(0);
  const [lastEditedBy, setLastEditedBy] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
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

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      name,
    });
  };
  const handleDeleteSuccess = (id: string) => {
    setRouteData((prevData) => prevData.filter((row) => row.id !== id));
  };

  const columns = [
    { header: "Route Name", key: "route_name" },
    { header: "Start Location", key: "start_location" },
    { header: "End Location", key: "end_location" },
    { header: "Status", key: "status" },
    {
      header: "Created At",
      key: "created_at",
      render: (row: Route) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: "Actions",
      key: "actions",
      render: (route: Route) => (
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            openDeleteModal(route.id, route.route_name);
          }}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      ),
    },
  ];

  const fetchRoutes = async () => {
    try {
      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: PAGE_SIZE.toString(),
      };

      if (activeFilters.search) params.search = activeFilters.search;
      if (activeFilters.startDate) params.startDate = activeFilters.startDate;
      if (activeFilters.endDate) params.endDate = activeFilters.endDate;

      const queryString = new URLSearchParams(params).toString();

      const response = await apiClient.get(
        `/master-trips/routes?${queryString}`,
      );

      const res = response as any;

      const routeList = res?.data || [];
      const total = res?.total ?? 0;
      const totalPagesCount = res?.totalPages ?? 1;

      setRouteData(routeList);
      setTotalRecords(total);
      setTotalPages(totalPagesCount);
      setActiveRecords(
        routeList.filter((r: Route) => r.status === "Active").length,
      );
      setInactiveRecords(
        routeList.filter((r: Route) => r.status === "Inactive").length,
      );
      setLastEditedBy(res?.lastEditedBy || "N/A");
    } catch (err) {
      console.error("Failed to fetch routes:", err);
      setRouteData([]);
    }
  };
  useEffect(() => {
    fetchRoutes();
  }, [currentPage, activeFilters]);

  const handleAddRoute = () => {
    setModalMode("create");
    setSelectedRoute(null);
    setModalOpen(true);
  };

  console.log("Selected Route for Edit:", selectedRoute);

  const handleCloseModal = () => setModalOpen(false);

  const handleSubmitRoute = async (data: RouteFormData) => {
    try {
      if (modalMode === "create") {
        await apiClient.post("/master-trips/routes", data);
      }

      if (modalMode === "update" && selectedRoute) {
        await apiClient.patch(`/master-trips/routes/${selectedRoute.id}`, {
          route_name: data.route_name,
          start_location: data.start_location,
          end_location: data.end_location,
        });
      }

      setModalOpen(false);

      await fetchRoutes();

      setSelectedRoute(null);
    } catch (err: any) {
      console.error("UPDATE ERROR:", err?.response?.data || err);
    }
  };

  return (
    <>
      <PageGridLayout
        sidebar={
          <div className={styles.sidebarWrapper}>
            <div className={styles.topSection}>
              <p className={styles.gridBoxTitle}>Route Search</p>
              <hr className={styles.cuttingLine} />

              <div className={styles.searchContainer}>
                <TextInput
                  label="Searching"
                  placeholder="Search routes..."
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

                <ActionBtn type="reset" variant="action" onClick={resetFilters}>
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
                    <p className={styles.textSuccess}>{activeRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Inactive Routes :</p>
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

            <p className={styles.tableTitle}>ROUTES MASTER RECORDS</p>

            <div className={styles.headerActionArea}>
              <NavigationBtn
                href="#"
                leftIcon={faPlus}
                onClick={handleAddRoute}
              >
                add route
              </NavigationBtn>
            </div>
          </div>

          <DataTable
            data={routeData}
            columns={columns}
            onRowClick={(row) => {
              setModalMode("update");
              setSelectedRoute(row);
              setModalOpen(true);
            }}
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
          name="Route"
          id={deleteModal.id}
          apiRoute="master-trips/routes"
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}

      <AddRouteModal
        open={modalOpen}
        mode={modalMode}
        initialData={selectedRoute || undefined}
        onClose={handleCloseModal}
        onSubmit={handleSubmitRoute}
      />
    </>
  );
}
