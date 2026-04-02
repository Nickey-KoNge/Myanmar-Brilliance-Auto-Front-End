"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faCalendarDays,
  faClockRotateLeft,
  faPlus,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

// UI Components
import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import DeleteModal from "@/app/components/ui/Delete/DeleteModal";

import { apiClient } from "@/app/features/lib/api-client";
import { useFilters } from "@/app/hooks/userFilters";
import styles from "./page.module.css";

// 🔥 Toggle Dummy Mode
const USE_DUMMY = true;

// Group Interface
interface Group {
  id: string;
  group_info: string;
  group_type: string;
  station: string;
  description: string;
}

export default function GroupPage() {
  const router = useRouter();

  // States
  const [groups, setGroups] = useState<Group[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const PAGE_SIZE = 10;

  // Filters
  const { filters, updateFilter, resetFilters } = useFilters(
    { search: "", startDate: "", endDate: "" },
    () => setCurrentPage(1)
  );

  // ✅ Fetch / Dummy Logic
  useEffect(() => {
    const fetchGroups = async () => {
      // ======================
      // 🔥 DUMMY DATA MODE
      // ======================
      if (USE_DUMMY) {
        const allDummy: Group[] = Array.from({ length: 50 }, (_, i) => ({
          id: `${i + 1}`,
          group_info: `Group ${i + 1}`,
          group_type: i % 2 === 0 ? "System" : "Department",
          station: ["Yangon", "Mandalay", "Bago"][i % 3],
          description: `This is dummy group ${i + 1}`,
        }));

        // ✅ Search filter
        const filtered = allDummy.filter((g) =>
          g.group_info.toLowerCase().includes((filters.search as string).toLowerCase())
        );

        // ✅ Pagination
        const start = (currentPage - 1) * PAGE_SIZE;
        const paginated = filtered.slice(start, start + PAGE_SIZE);

        setGroups(paginated);
        setTotalRecords(filtered.length);
        setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));

        return;
      }

      // ======================
      // 🌐 API MODE
      // ======================
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: PAGE_SIZE.toString(),
          search: filters.search as string,
          startDate: filters.startDate as string,
          endDate: filters.endDate as string,
        });

        const response = await apiClient.get(`/master-group/group?${params.toString()}`);
        const res = response as any;

        setGroups(res.data || []);
        setTotalRecords(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } catch (error) {
        console.error("Fetch error:", error);

        // 🔁 fallback
        setGroups([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
    };

    fetchGroups();
  }, [currentPage, filters]);

  // Table Columns
  const columns = [
    {
      header: "Groups Info",
      key: "group_info",
      render: (group: Group) => (
        <div style={{ fontWeight: "600" }}>{group.group_info}</div>
      ),
    },
    {
      header: "Groups Type",
      key: "group_type",
      render: (group: Group) => <div>{group.group_type}</div>,
    },
    {
      header: "Station",
      key: "station",
      render: (group: Group) => <div>{group.station}</div>,
    },
    {
      header: "Description",
      key: "description",
      render: (group: Group) => (
        <div style={{ color: "#aaa", fontSize: "12px" }}>
          {group.description}
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (group: Group) => (
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedGroup({ id: group.id, name: group.group_info });
            setIsDeleteOpen(true);
          }}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      ),
    },
  ];

  return (
    <>
      {/* HEADER */}
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faLayerGroup} />,
          text: "Groups Management",
        }}
        actionNode={
          <NavigationBtn href="/groups/Addgroup" leftIcon={faPlus}>
            Add Groups
          </NavigationBtn>
        }
      />

      <PageGridLayout
        sidebar={
          <div className={styles.sidebarWrapper}>
            {/* SEARCH */}
            <div className={styles.topSection}>
              <p className={styles.gridBoxTitle}>Group Search</p>
              <hr className={styles.cuttingLine} />

              <div className={styles.searchContainer}>
                <TextInput
                  label="SEARCH"
                  placeholder="Search by group name..."
                  value={filters.search}
                  onChange={(e) =>
                    updateFilter("search", e.target.value)
                  }
                />

                <div className={styles.filterRow}>
                  <DateInput
                    label="FROM"
                    value={filters.startDate}
                    onChange={(e) =>
                      updateFilter("startDate", e.target.value)
                    }
                    rightIcon={faCalendarDays}
                  />
                  <DateInput
                    label="TO"
                    value={filters.endDate}
                    onChange={(e) =>
                      updateFilter("endDate", e.target.value)
                    }
                    rightIcon={faCalendarDays}
                  />
                </div>

                <ActionBtn onClick={resetFilters}>
                  RESET
                </ActionBtn>
              </div>
            </div>

            {/* STATS */}
            <div className={styles.bottomSection}>
              <hr className={styles.cuttingLine} />

              <div className={styles.recentRecord}>
                <span className={styles.iconBox}>
                  <FontAwesomeIcon icon={faClockRotateLeft} />
                </span>

                <div className={styles.recordContent}>
                  <p className={styles.recentTitle}>
                    RECENT RECORD
                  </p>

                  <div className={styles.stat}>
                    <div className={styles.statItem}>
                      <p>Total Groups :</p>
                      <p className={styles.textDanger}>
                        {totalRecords}
                      </p>
                    </div>

                    <div className={styles.statItem}>
                      <p>Active Groups :</p>
                      <p className={styles.textSuccess}>
                        {Math.floor(totalRecords * 0.8)}
                      </p>
                    </div>

                    <div className={styles.statItem}>
                      <p>Inactive Groups :</p>
                      <p className={styles.textDanger}>
                        {Math.floor(totalRecords * 0.2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className={styles.cuttingLine} />
              <p className={styles.lastEdited}>
                Last Edited : Admin
              </p>
            </div>
          </div>
        }
      >
        {/* TABLE */}
        <div className={styles.mainTableArea}>
          <p className={styles.gridBoxTitle}>
            GROUPS MASTER RECORDS
          </p>

          <DataTable
            data={groups}
            columns={columns}
            onRowClick={(g) =>
              router.push(`/groups/Updategroup/${g.id}`)
            }
          />
        </div>

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </PageGridLayout>

      {/* DELETE MODAL */}
      {isDeleteOpen && selectedGroup && (
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          itemName={selectedGroup.name}
          name="Group"
          id={selectedGroup.id}
          apiRoute="master-group/group"
          onDeleteSuccess={(id) =>
            setGroups((prev) =>
              prev.filter((g) => g.id !== id)
            )
          }
        />
      )}
    </>
  );
}