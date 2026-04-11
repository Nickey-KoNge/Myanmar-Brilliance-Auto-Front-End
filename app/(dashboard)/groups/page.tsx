"use client";

import React, { useEffect, useState, useCallback } from "react";
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

const USE_DUMMY = false;

interface Group {
  id: string;
  group_name: string;
  group_type: string;
  station_id: string;
  description: string;
  status: string;
}

export default function GroupPage() {
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const PAGE_SIZE = 10;

  const { filters, updateFilter, resetFilters } = useFilters(
    { search: "", fromDate: "", toDate: "" },
    () => setCurrentPage(1)
  );

  const fetchGroups = useCallback(async () => {
    if (USE_DUMMY) return;
  
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: PAGE_SIZE.toString(),
        search: String(filters.search || ""),
        fromDate: String(filters.fromDate || ""),
        toDate: String(filters.toDate || ""),
      });
  
      const response = await apiClient.get(`/group/list`);
console.log(response);
  
      const res = response?.data || response;
  
      console.log("API RESPONSE:", res); // debug
  
      // ✅ FIX HERE
      if (res && res.items) {
        setGroups(res.items || []);
        setTotalRecords(res.meta?.totalItems || 0);
        setTotalPages(res.meta?.totalPages || 1);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setGroups([]);
      setTotalRecords(0);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const columns = [
    {
      header: "Groups Name",
      key: "group_name",
      render: (group: Group) => <div style={{ fontWeight: "600" }}>{group.group_name}</div>,
    },
    {
      header: "Groups Type",
      key: "group_type",
      render: (group: Group) => <div>{group.group_type}</div>,
    },
    {
      header: "Station ID",
      key: "station_id",
      render: (group: Group) => <div>{group.station_id}</div>,
    },
    {
      header: "Status",
      key: "status",
      render: (group: Group) => (
        <div className={group.status === 'Active' ? styles.textSuccess : styles.textDanger}>
          {group.status}
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
            setSelectedGroup({ id: group.id, name: group.group_name });
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
      <PageHeader
        titleData={{ icon: <FontAwesomeIcon icon={faLayerGroup} />, text: "Groups Management" }}
        actionNode={
          <NavigationBtn href="/groups/Addgroup" leftIcon={faPlus}>Add Groups</NavigationBtn>
        }
      />

      <PageGridLayout
        sidebar={
          <div className={styles.sidebarWrapper}>
            <div className={styles.topSection}>
              <p className={styles.gridBoxTitle}>Group Search</p>
              <hr className={styles.cuttingLine} />
              <div className={styles.searchContainer}>
                <TextInput
                  label="SEARCH"
                  placeholder="Search group..."
                  value={String(filters.search)}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />
                <div className={styles.filterRow}>
                  <DateInput
                    label="FROM"
                    value={String(filters.fromDate)}
                    onChange={(e) => updateFilter("fromDate", e.target.value)}
                    rightIcon={faCalendarDays}
                  />
                  <DateInput
                    label="TO"
                    value={String(filters.toDate)}
                    onChange={(e) => updateFilter("toDate", e.target.value)}
                    rightIcon={faCalendarDays}
                  />
                </div>
                <ActionBtn onClick={resetFilters}>RESET</ActionBtn>
              </div>
            </div>
            
            <div className={styles.bottomSection}>
              <hr className={styles.cuttingLine} />
              <div className={styles.recentRecord}>
                <span className={styles.iconBox}><FontAwesomeIcon icon={faClockRotateLeft} /></span>
                <div className={styles.recordContent}>
                  <p className={styles.recentTitle}>TOTAL RECORDS</p>
                  <p className={styles.textDanger} style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    {totalRecords}
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div className={styles.mainTableArea}>
          <p className={styles.gridBoxTitle}>GROUPS MASTER RECORDS</p>
          <DataTable
            data={groups}
            columns={columns}
            onRowClick={(g) => router.push(`/groups/Updategroup/${g.id}`)}
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </PageGridLayout>

      {isDeleteOpen && selectedGroup && (
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          itemName={selectedGroup.name}
          name="Group"
          id={selectedGroup.id}
          apiRoute="group"
          onDeleteSuccess={() => {
            setIsDeleteOpen(false);
            fetchGroups(); // List ကို ပြန် update လုပ်တယ်
          }}
        />
      )}
    </>
  );
}