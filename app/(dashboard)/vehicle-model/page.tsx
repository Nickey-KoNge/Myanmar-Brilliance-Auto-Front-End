"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrashCan,
  faClockRotateLeft,
  faCarSide,
} from "@fortawesome/free-solid-svg-icons";

import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";
import DeleteModal from "@/app/components/ui/Delete/DeleteModal";

import styles from "./page.module.css";
import { apiClient } from "@/app/features/lib/api-client";

const PAGE_SIZE = 10;

export default function VehicleModelListPage() {
  const router = useRouter();
  const [models, setModels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeRecords, setActiveRecords] = useState(0);
  const [inactiveRecords, setInactiveRecords] = useState(0);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: "",
  });

  const fetchModels = async () => {
    try {
      const response = await apiClient.get(`/vehicle-model/list`, {
        params: {
          page: currentPage,
          limit: PAGE_SIZE,
          search: search,
          startDate: fromDate,
          endDate: toDate,
        },
      });

      const resData = response?.data || response;

      if (resData && resData.items) {
        setModels(resData.items);
        setTotalPages(resData.meta?.totalPages || 1);
        setTotalRecords(resData.meta?.totalItems || 0);
        setActiveRecords(resData.meta.activeItems || 0);
        setInactiveRecords(resData.meta.inactiveItems || 0);
      }
    } catch (error) {
      console.error("Error fetching vehicle models:", error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [currentPage, search, fromDate, toDate]);

  const columns = [
    {
      header: "Model Name",
      key: "vehicle_model_name",
      render: (model: any) => (
        <span className={styles.mainName}>{model.vehicle_model_name}</span>
      ),
    },
    { header: "Brand", key: "vehicle_brand_name" }, // Serializer မှ လာသော field
    { header: "Body Type", key: "body_type" },
    { header: "Fuel Type", key: "fuel_type" },
    { header: "Transmission", key: "transmission" },
    { header: "Engine", key: "engine_capacity" },
    {
      header: "Status",
      key: "status",
      render: (model: any) => (
        <span
          className={
            model.status === "Active" ? styles.textSuccess : styles.textDanger
          }
        >
          {model.status}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (model: any) => (
        <button
          className={styles.actionIconBtn}
          onClick={(e) => {
            e.stopPropagation();
            setDeleteModal({
              isOpen: true,
              id: model.id,
              name: model.vehicle_model_name,
            });
          }}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      ),
    },
  ];

  return (
    <>
      <div className={styles.headerCard}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.headerIconBox}>
            <FontAwesomeIcon icon={faCarSide} className={styles.headerIcon} />
          </div>
          <h2 className={styles.headerTitle}>Vehicle Model Management</h2>
        </div>
        <NavigationBtn href="/vehicle-model/Addvehiclemodel" leftIcon={faPlus}>
          ADD MODEL
        </NavigationBtn>
      </div>

      <PageGridLayout
        sidebar={
          <div className={styles.sidebarWrapper}>
            <div className={styles.searchCard}>
              <p className={styles.sidebarTitle}>Model Search</p>
              <div className={styles.searchContent}>
                <p className={styles.searchLabel}>Searching</p>
                <TextInput
                  placeholder="Search model, brand etc..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className={styles.filterRow}>
                  <DateInput
                    label="From"
                    value={fromDate}
                    onChange={(e: any) => setFromDate(e.target.value)}
                  />
                  <DateInput
                    label="To"
                    value={toDate}
                    onChange={(e: any) => setToDate(e.target.value)}
                  />
                </div>
                <ActionBtn
                  variant="action"
                  className={styles.resetBtn}
                  onClick={() => {
                    setSearch("");
                    setFromDate("");
                    setToDate("");
                    setCurrentPage(1);
                  }}
                >
                  Reset Filters
                </ActionBtn>
              </div>
            </div>

            <div className={styles.statsCard}>
              <p className={styles.sidebarTitle}>
                <FontAwesomeIcon icon={faClockRotateLeft} /> RECENT RECORD
              </p>
              <div className={styles.statList}>
                <div className={styles.statItem}>
                  <span>Total Models :</span>{" "}
                  <strong className={styles.textDanger}>{totalRecords}</strong>
                </div>
                <div className={styles.statItem}>
                  <span>Active Driver :</span>{" "}
                  <strong className={styles.textSuccess}>
                    {activeRecords}
                  </strong>
                </div>
                <div className={styles.statItem}>
                  <span>Inactive Driver :</span>{" "}
                  <strong className={styles.textDanger}>
                    {inactiveRecords}
                  </strong>
                </div>
              </div>
              <p className={styles.lastEdited}>
                Last Edited :{" "}
                <span className={styles.textDanger}>Nickey (Admin)</span>
              </p>
            </div>
          </div>
        }
      >
        <div className={styles.tablePageWrapper}>
          <div className={styles.tableMainContent}>
            <div className={styles.tableHeaderArea}>
              <p className={styles.tableTitle}>VEHICLE MODEL MASTER RECORDS</p>
            </div>

            <div className={styles.dataTable}>
              <DataTable
                columns={columns}
                data={models}
                onRowClick={(m) =>
                  router.push(`/vehicle-model/Updatevehiclemodel/${m.id}`)
                }
              />
            </div>
          </div>

          <div className={styles.stickyFooterPagination}>
            <div className={styles.paginationWrapper}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
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
          name="vehicle-model"
          id={deleteModal.id}
          apiRoute="/vehicle-model"
          onDeleteSuccess={fetchModels}
        />
      )}
    </>
  );
}
