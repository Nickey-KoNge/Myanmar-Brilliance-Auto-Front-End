// "use client";

// import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
// import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
// import { DataTable } from "@/app/components/ui/DataTable/DataTable";
// import DeleteModal from "@/app/components/ui/Delete/DeleteModal";
// // import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
// import { Pagination } from "@/app/components/ui/Pagination/Pagination";
// import { apiClient } from "@/app/features/lib/api-client";
// import { FilterState, useFilters } from "@/app/hooks/userFilters";
// import {
//   faCalendarDays,
//   faChargingStation,
//   faClockRotateLeft,
//   faPlus,
//   faTrashCan,
// } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import styles from "./page.module.css";
// import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
// import DateInput from "@/app/components/ui/SearchBoxes/DateInput";
// import ActionBtn from "@/app/components/ui/Button/ActionBtn";

// interface Station {
//   id: string;
//   station_name: string;
//   branches_id: string;
//   branches_name: string;
//   gps_location: string;
//   phone: string;
//   description: string;
//   fullAddress: string;
// }

// export default function StationPage() {
//   const router = useRouter();
//   const [stationData, setStationData] = useState<Station[]>([]);
//   const [isDeleteOpen, setIsDeleteOpen] = useState(false);
//   const [selectedStation, setSelectedStation] = useState<Station | null>(null);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalRecords, setTotalRecords] = useState(0);
//   const PAGE_SIZE = 6;

//   const [activeFilters, setActiveFilters] = useState<FilterState>({
//     search: "",
//     startDate: "",
//     endDate: "",
//   });

//   const { filters, updateFilter, resetFilters } = useFilters(
//     { search: "", startDate: "", endDate: "" },
//     (debouncedFilters: FilterState) => {
//       const isFilterChanged =
//         activeFilters.search !== debouncedFilters.search ||
//         activeFilters.startDate !== debouncedFilters.startDate ||
//         activeFilters.endDate !== debouncedFilters.endDate;

//       setActiveFilters(debouncedFilters);

//       if (isFilterChanged) {
//         setCurrentPage(1);
//       }
//     },
//   );

//   const columns = [
//     {
//       header: "Stations Info",
//       key: "station_name",
//     },
//     { header: "Branch", key: "branch_name" },
//     { header: "Location", key: "gps_location" },
//     { header: "Address", key: "fullAddress" },
//     { header: "Description", key: "description" },
//     { header: "Phone", key: "phone" },
//     {
//       header: "Actions",
//       key: "actions",
//       render: (station: Station) => (
//         <button
//           className={styles.deleteBtn}
//           onClick={(e) => {
//             e.stopPropagation();
//             setSelectedStation(station);
//             setIsDeleteOpen(true);
//           }}
//         >
//           <FontAwesomeIcon icon={faTrashCan} />
//         </button>
//       ),
//     },
//   ];

//   const fetchStationData = async () => {
//     try {
//       const params: Record<string, string> = {
//         page: currentPage.toString(),
//         limit: PAGE_SIZE.toString(),
//       };
//       if (activeFilters.search) params.search = activeFilters.search as string;
//       if (activeFilters.startDate)
//         params.startDate = activeFilters.startDate as string;
//       if (activeFilters.endDate)
//         params.endDate = activeFilters.endDate as string;
//       const queryString = new URLSearchParams(params).toString();
//       const response = await apiClient.get(
//         `/master-company/stations?${queryString}`,
//       );
//       const res = response as unknown as {
//         data?:
//           | Station[]
//           | { data?: Station[]; total?: number; totalPages?: number };
//         total?: number;
//         totalPages?: number;
//       };

//       let stationList: Station[] = [];
//       let total = 0;
//       let totalPages = 1;

//       if (res && typeof res === "object") {
//         if (Array.isArray(res.data)) {
//           stationList = res.data;
//           total = res.total || 0;
//           totalPages = res.totalPages || 1;
//         } else if (
//           res.data &&
//           typeof res.data === "object" &&
//           Array.isArray(res.data.data)
//         ) {
//           stationList = res.data.data;
//           total = res.data.total || 0;
//           totalPages = res.data.totalPages || 1;
//         }
//       }

//       setStationData(stationList);
//       setTotalRecords(total);
//       setTotalPages(totalPages);
//     } catch (error) {
//       setStationData([]);
//     }
//   };

//   useEffect(() => {
//     fetchStationData();
//   }, [currentPage, activeFilters]);

//   const handleDeleteSuccess = (id: string) => {
//     setStationData((prevData) => prevData.filter((row) => row.id !== id));
//   };

//   return (
//     <>
//       <PageGridLayout
//         sidebar={
//           <div className={styles.sidebarWrapper}>
//             <div className={styles.topSection}>
//               <p className={styles.gridBoxTitle}>Station Search</p>
//               <hr className={styles.cuttingLine} />

//               <div className={styles.searchContainer}>
//                 <TextInput
//                   label="Searching"
//                   placeholder="Search by name, email..."
//                   value={filters.search}
//                   onChange={(e) => updateFilter("search", e.target.value)}
//                 />

//                 <div className={styles.filterRow}>
//                   <div className={styles.filterRow}>
//                     <DateInput
//                       label="From"
//                       value={filters.startDate}
//                       onChange={(e) =>
//                         updateFilter("startDate", e.target.value)
//                       }
//                       rightIcon={faCalendarDays}
//                     />
//                   </div>

//                   <DateInput
//                     label="To"
//                     value={filters.endDate}
//                     onChange={(e) => updateFilter("endDate", e.target.value)}
//                     rightIcon={faCalendarDays}
//                   />
//                 </div>

//                 <div style={{ alignSelf: "flex-start" }}>
//                   <ActionBtn
//                     type="reset"
//                     variant="action"
//                     fullWidth={false}
//                     onClick={resetFilters}
//                   >
//                     reset
//                   </ActionBtn>
//                 </div>
//               </div>
//             </div>

//             <div className={styles.bottomSection}>
//               <hr className={styles.cuttingLine} />

//               <div className={styles.recentRecord}>
//                 <span>
//                   <FontAwesomeIcon icon={faClockRotateLeft} />
//                 </span>
//                 <p className={styles.recentTitle}>RECENT RECORD</p>
//                 <span />
//                 <div className={styles.stat}>
//                   <div>
//                     <p className={styles.statLable}>Total Stations :</p>
//                     <p className={styles.textDanger}>{totalRecords}</p>
//                   </div>
//                   <div>
//                     <p className={styles.statLable}>Active Staions :</p>
//                     <p className={styles.textSuccess}>36</p>
//                   </div>
//                   <div>
//                     <p className={styles.statLable}>Inactive Stations :</p>
//                     <p className={styles.textDanger}>4</p>
//                   </div>
//                 </div>
//               </div>

//               <hr className={styles.cuttingLine} />
//               <p className={styles.lastEdited}>
//                 Last Edited :{" "}
//                 <span className={styles.spanText}>Nickey (Admin)</span>
//               </p>
//             </div>
//           </div>
//         }
//       >
//         <div>
//           <div className={styles.tableHeaderArea}>
//             <div className={styles.paginationInfoWrapper}>
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 totalRecords={totalRecords}
//                 pageSize={PAGE_SIZE}
//                 onPageChange={setCurrentPage}
//                 showOnlyInfo={true}
//               />
//             </div>
//             <p className={styles.tableTitle}>STATIONS MASTER RECORDS</p>

//             <div className={styles.headerActionArea}>
//               <NavigationBtn href="/station/Addstation" leftIcon={faPlus}>
//                 add station
//               </NavigationBtn>
//             </div>
//           </div>
//           <DataTable
//             data={stationData}
//             columns={columns}
//             onRowClick={(station) =>
//               router.push(`/station/Updatestation/${station.id}`)
//             }
//           />
//         </div>

//         <Pagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           totalRecords={totalRecords}
//           pageSize={PAGE_SIZE}
//           onPageChange={setCurrentPage}
//           showOnlyActions={true}
//         />
//       </PageGridLayout>
//       {isDeleteOpen && selectedStation && (
//         <DeleteModal
//           isOpen={isDeleteOpen}
//           onClose={() => setIsDeleteOpen(false)}
//           itemName={selectedStation.station_name}
//           name="Station"
//           id={selectedStation.id}
//           apiRoute="master-company/stations"
//           onDeleteSuccess={handleDeleteSuccess}
//         />
//       )}
//     </>
//   );
// }
"use client";

import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import DeleteModal from "@/app/components/ui/Delete/DeleteModal";
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import { apiClient } from "@/app/features/lib/api-client";
import { FilterState, useFilters } from "@/app/hooks/userFilters";
import {
  faCalendarDays,
  faClockRotateLeft,
  faPlus,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; 
import styles from "./page.module.css";
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";

interface Station {
  id: string;
  station_name: string;
  branches_id: string;
  branches_name: string;
  gps_location: string;
  phone: string;
  description: string;
  fullAddress: string;
}

export default function StationPage() {
  const router = useRouter();
  const [stationData, setStationData] = useState<Station[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
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

  const columns = [
    { header: "Stations Info", key: "station_name" },
    { header: "Branch", key: "branches_name" }, // key ကို branches_name သို့ ပြင်ပါ (Interface နှင့် ကိုက်ရန်)
    { header: "Location", key: "gps_location" },
    { header: "Address", key: "fullAddress" },
    { header: "Description", key: "description" },
    { header: "Phone", key: "phone" },
    {
      header: "Actions",
      key: "actions",
      render: (station: Station) => (
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStation(station);
            setIsDeleteOpen(true);
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
        if (activeFilters.search) params.search = activeFilters.search;
        if (activeFilters.startDate) params.startDate = activeFilters.startDate;
        if (activeFilters.endDate) params.endDate = activeFilters.endDate;

        const queryString = new URLSearchParams(params).toString();
        const response = await apiClient.get(
          `/master-company/stations?${queryString}`,
        );

        const res = response as unknown as {
          data?:
            | Station[]
            | { data?: Station[]; total?: number; totalPages?: number };
          total?: number;
          totalPages?: number;
        };

        let stationList: Station[] = [];
        let total = 0;
        let totalPagesCount = 1;

        if (res && typeof res === "object") {
          if (Array.isArray(res.data)) {
            stationList = res.data;
            total = res.total || 0;
            totalPagesCount = res.totalPages || 1;
          } else if (
            res.data &&
            typeof res.data === "object" &&
            Array.isArray(res.data.data)
          ) {
            stationList = res.data.data;
            total = res.data.total || 0;
            totalPagesCount = res.data.totalPages || 1;
          }
        }

        setStationData(stationList);
        setTotalRecords(total);
        setTotalPages(totalPagesCount);
      } catch (err) {
        console.error("Failed to fetch:", err);
        setStationData([]);
      }
    };

    fetchData();
  }, [currentPage, activeFilters]);
  const handleDeleteSuccess = (id: string) => {
    setStationData((prevData) => prevData.filter((row) => row.id !== id));
  };
  return (
    <>
 

      <PageGridLayout
        sidebar={
          <div className={styles.sidebarWrapper}>
            <div className={styles.topSection}>
              <p className={styles.gridBoxTitle}>Station Search</p>
              <hr className={styles.cuttingLine} />

              <div className={styles.searchContainer}>
                <TextInput
                  label="Searching"
                  placeholder="Search by name, email..."
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
                    <p className={styles.statLable}>Total Stations :</p>
                    <p className={styles.textDanger}>{totalRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLable}>Active Stations :</p>
                    <p className={styles.textSuccess}>36</p>
                  </div>
                  <div>
                    <p className={styles.statLable}>Inactive Stations :</p>
                    <p className={styles.textDanger}>4</p>
                  </div>
                </div>
              </div>

              <hr className={styles.cuttingLine} />
              <p className={styles.lastEdited}>
                Last Edited :{" "}
                <span className={styles.spanText}>Nickey (Admin)</span>
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
            <p className={styles.tableTitle}>STATIONS MASTER RECORDS</p>

            <div className={styles.headerActionArea}>
              <NavigationBtn href="/station/Addstation" leftIcon={faPlus}>
                add station
              </NavigationBtn>
            </div>
          </div>
          <DataTable
            data={stationData}
            columns={columns}
            onRowClick={(station) =>
              router.push(`/station/Updatestation/${station.id}`)
            }
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
      {isDeleteOpen && selectedStation && (
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          itemName={selectedStation.station_name}
          name="Station"
          id={selectedStation.id}
          apiRoute="master-company/stations"
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
