"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrashCan,
  faUser,
  faRotateLeft,
  faClockRotateLeft,
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

export default function DriverListPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [activeRecords, setActiveRecords] = useState(0);
  const [inactiveRecords, setInactiveRecords] = useState(0);
  const [fromDate, setFromDate] = useState(""); // <--- အသစ်ထည့်ပါ
  const [toDate, setToDate] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: "",
  });

  const fetchDrivers = async () => {
    try {
      const response = await apiClient.get(`/driver/list`, {
        params: {
          page: currentPage,
          limit: PAGE_SIZE,
          search: search,
          fromDate: fromDate,
          toDate: toDate,
        },
      });

      const resData = response?.data || response;

      console.log("Fetched Data:", resData);

      if (resData && resData.items) {
        setDrivers(resData.items);
        setTotalPages(resData.meta?.totalPages || 1);
        setTotalRecords(resData.meta?.totalItems || 0);
        setActiveRecords(resData.meta.activeItems || 0);
        setInactiveRecords(resData.meta.inactiveItems || 0);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [currentPage, search, fromDate, toDate]);

  const columns = [
    {
      header: "Driver Info",
      key: "driver_name",
      render: (driver: any) => {
        // ပုံမရှိရင်ပြဖို့ Default avatar
        const defaultImage = "/default-user.png";

        // Backend က full URL ပေးထားရင် အဲ့ဒါသုံးမယ်၊ မဟုတ်ရင် path ဆက်ပေးမယ်
        const src = driver.image
          ? driver.image.startsWith("http")
            ? driver.image
            : `http://localhost:3001${driver.image}`
          : defaultImage;

        return (
          <div className={styles.staffInfo}>
            <div className={styles.imageContainer}>
              <Image
                src={src}
                alt={driver.driver_name}
                width={40}
                height={40}
                className={styles.staffImg}
                unoptimized // localhost မှာ စမ်းသပ်နေချိန် image optimization error မတက်အောင် သုံးနိုင်ပါတယ်
              />
            </div>
            <span className={styles.mainName}>{driver.driver_name}</span>
          </div>
        );
      },
    },
    { header: "License No", key: "license_no" },
    { header: "Address", key: "address", className: styles.addressCell },
    { header: "DOB", key: "dob", render: (d: any) => d.dob?.split("T")[0] },
    { header: "NRC", key: "nrc" },
    { header: "Phone", key: "phone" },
    {
      header: "Actions",
      key: "actions",
      render: (driver: any) => (
        <button
          className={styles.actionIconBtn} // Class နာမည်အသစ်
          onClick={(e) => {
            e.stopPropagation();
            setDeleteModal({
              isOpen: true,
              id: driver.id,
              name: driver.driver_name,
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
      <PageGridLayout
        sidebar={
          <div className={styles.sidebarWrapper}>
            <div className={styles.searchCard}>
              <p className={styles.sidebarTitle}>Driver Search</p>
              <div className={styles.searchContent}>
                <p className={styles.searchLabel}>Searching</p>
                <TextInput
                  placeholder="Searching Name , Email, Address etc ..."
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
                    setSearch(""); // Search အလွတ်ဖြစ်အောင် လုပ်မယ်
                    setFromDate(""); // From Date အလွတ်ဖြစ်အောင် လုပ်မယ်
                    setToDate(""); // To Date အလွတ်ဖြစ်အောင် လုပ်မယ်
                    setCurrentPage(1); // Page 1 ကို ပြန်သွားမယ်
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
                  <span>Total Driver :</span>{" "}
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
        <div className={styles.tableContainer}>
          <div className={styles.tableHeaderArea}>
            <p className={styles.tableTitle}>DRIVER MASTER RECORDS</p>
            <div className={styles.headerActionArea}>
              <NavigationBtn href="/driver/Adddriver" leftIcon={faPlus}>
                ADD DRIVER
              </NavigationBtn>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={drivers}
            onRowClick={(d) => router.push(`/driver/Updatedriver/${d.id}`)}
          />

          <div className={styles.bottomPagination}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </PageGridLayout>

      {deleteModal.isOpen && deleteModal.id && (
        <DeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
          itemName={deleteModal.name}
          name="driver"
          id={deleteModal.id}
          apiRoute="/driver"
          onDeleteSuccess={fetchDrivers}
        />
      )}
    </>
  );
}
