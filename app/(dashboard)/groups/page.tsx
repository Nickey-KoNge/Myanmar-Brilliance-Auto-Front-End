"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faClockRotateLeft,
  faPlus,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

// UI Components
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import DeleteModal from "@/app/components/ui/Delete/DeleteModal";

import { apiClient } from "@/app/features/lib/api-client";
import { FilterState, useFilters } from "@/app/hooks/userFilters";
import styles from "./page.module.css";

interface Group {
  id: string;
  group_name: string;
  group_type: string;
  station_id: string;
  station_name: string;
  description: string;
  status: string;
}

interface PaginatedGroupResponse {
  data?:
    | Group[]
    | {
        data?: Group[];
        total?: number;
        totalPages?: number;
        activeCount?: number;
        inactiveCount?: number;
        lastEditedBy?: string;
      };
  total?: number;
  totalPages?: number;
  activeCount?: number;
  inactiveCount?: number;
  lastEditedBy?: string;
}
export default function GroupPage() {
  const router = useRouter();

  const [groupsData, setGroupsData] = useState<Group[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [activeRecords, setActiveRecords] = useState(0);
  const [inactiveRecords, setInactiveRecords] = useState(0);
  const [lastEditedBy, setLastEditedBy] = useState("Unknown");
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
    {
      header: "Groups Name",
      key: "group_name",
    },
    {
      header: "Groups Type",
      key: "group_type",
    },
    {
      header: "Station Name",
      key: "station_name",
    },

    {
      header: "Actions",
      key: "actions",
      render: (group: Group) => (
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedGroup(group);
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
          `master-company/groups?${queryString}`,
        );

        const res = response as unknown as PaginatedGroupResponse;

        let groupList: Group[] = [];
        let total = 0;
        let totalPagesCount = 1;

        if (res && typeof res === "object") {
          if (Array.isArray(res.data)) {
            groupList = res.data;
            total = res.total || 0;
            totalPagesCount = res.totalPages || 1;
            setActiveRecords(res.activeCount || 0);
            setInactiveRecords(res.inactiveCount || 0);
            setLastEditedBy(res.lastEditedBy || "Unknown");
          } else if (
            res.data &&
            typeof res.data === "object" &&
            Array.isArray(res.data.data)
          ) {
            groupList = res.data.data;
            total = res.data.total || 0;
            totalPagesCount = res.data.totalPages || 1;
          }
        }

        setGroupsData(groupList);
        setTotalRecords(total);
        setTotalPages(totalPagesCount);
      } catch (err) {
        console.error("Failed to fetch:", err);
        setGroupsData([]);
      }
    };

    fetchData();
  }, [currentPage, activeFilters]);
  const handleDeleteSuccess = (id: string) => {
    setGroupsData((prevData) => prevData.filter((row) => row.id !== id));
  };
  return (
    <>
      <PageGridLayout
        sidebar={
          <div className={styles.sidebarWrapper}>
            <div className={styles.topSection}>
              <p className={styles.gridBoxTitle}>Group Search</p>
              <hr className={styles.cuttingLine} />
              <div className={styles.searchContainer}>
                <TextInput
                  label="SEARCH"
                  placeholder="Search by group name, group type..."
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
                    <p className={styles.statLable}>Total Groups :</p>
                    <p className={styles.textDanger}>{totalRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLable}>Active Groups :</p>
                    <p className={styles.textSuccess}>{activeRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLable}>Inactive Groups :</p>
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
            <p className={styles.tableTitle}>GROUPS MASTER RECORDS</p>
            <div className={styles.headerActionArea}>
              <NavigationBtn href="/groups/Addgroup" leftIcon={faPlus}>
                add group
              </NavigationBtn>
            </div>
          </div>
          <DataTable
            data={groupsData}
            columns={columns}
            onRowClick={(group) =>
              router.push(`/groups/Updategroup/${group.id}`)
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
      {isDeleteOpen && selectedGroup && (
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          itemName={selectedGroup.group_name}
          name="Station"
          id={selectedGroup.id}
          apiRoute="master-company/groups"
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
