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
} from "@fortawesome/free-solid-svg-icons";

// components
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
// pagination components
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
// styles
import styles from "./page.module.css";

import { apiClient } from "@/app/features/lib/api-client";
import TextInput from "@/app/components/ui/Inputs/TextInput";
import DateInput from "@/app/components/ui/Inputs/DateInput";
import DropdownInput from "@/app/components/ui/Inputs/DropdownInput";

// Hook
import { useFilters, FilterState } from "@/app/hooks/userFilters";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import DeleteModal from "@/app/components/ui/Delete/DeleteModal";

interface Staff {
  id: string;
  staffName: string;
  image: string;
  email: string;
  fullAddress: string;
  street_address: string;
  city: string;
  country: string;
  position: string;
  branches_name: string;
  role_name?: string;
  phone: string;
}

interface Branch {
  id: string;
  branches_name: string;
  company_id: string;
  company_name: string;
}

interface Role {
  id: string;
  role_name: string;
}

export default function StaffPage() {
  const router = useRouter();
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
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
  const [activeRecords, setActiveRecords] = useState(0);
  const [inactiveRecords, setInactiveRecords] = useState(0);
  const [lastEditedBy, setLastEditedBy] = useState("Unknown");
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
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
  // Fetch Staff Data
  useEffect(() => {
    const fetchStaffs = async () => {
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

        if (
          activeFilters.branchId &&
          activeFilters.branchId !== "all" &&
          activeFilters.branchId !== ""
        ) {
          params.branches_id = activeFilters.branchId as string;
        }

        if (
          activeFilters.roleId &&
          activeFilters.roleId !== "all" &&
          activeFilters.roleId !== ""
        ) {
          params.role_id = activeFilters.roleId as string;
        }

        const queryString = new URLSearchParams(params).toString();

        const response: unknown = await apiClient.get(
          `/master-company/staff?${queryString}`,
        );
        console.log("api staff return data :", response);

        const res = response as unknown as {
          data?:
            | Staff[]
            | {
                data?: Staff[];
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
        console.log("res return data :", response);
        let staffList: Staff[] = [];
        let total = 0;
        let totalPages = 1;

        if (res && typeof res === "object") {
          if (Array.isArray(res.data)) {
            staffList = res.data;
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
            staffList = res.data.data;
            total = res.data.total || 0;
            totalPages = res.data.totalPages || 1;
          }
        }

        setStaffs(staffList);
        setTotalRecords(total);
        setTotalPages(totalPages);
      } catch (error) {
        console.error("Failed to fetch staff:", error);
        setStaffs([]);
      }
    };
    fetchStaffs();
  }, [currentPage, activeFilters]);

  // Fetch Filters (Branches/Roles)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [branchesRes, rolesRes] = await Promise.all([
          apiClient.get("/master-company/branches"),
          apiClient.get("/master-service/roles"),
        ]);
        setBranches(branchesRes.data);
        setRoles(rolesRes.data);
      } catch (error) {
        console.error("Failed to fetch filters:", error);
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
    setStaffs((prev) => prev.filter((s) => s.id !== id));
  };

  const columns = [
    {
      header: "Staff Info",
      key: "staffName",
      render: (staff: Staff) => (
        <div className={styles.info}>
          <Image
            src={staff.image || "/default-user.png"}
            alt={staff.staffName}
            width={40}
            height={40}
            unoptimized
            className={styles.image}
          />
          {staff.staffName}
        </div>
      ),
    },
    { header: "Email", key: "email" },
    {
      header: "Address",
      key: "address",
      render: (staff: Staff) => {
        return staff.fullAddress ? staff.fullAddress : "-";
      },
    },
    { header: "Role", key: "role_name" },
    { header: "Branch", key: "branches_name" },
    { header: "Phone", key: "phone" },
    {
      header: "Actions",
      key: "actions",
      render: (staff: Staff) => (
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            openDeleteModal(staff.id, staff.staffName);
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
              <p className={styles.gridBoxTitle}>Employee Search</p>
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

                <div className={styles.filterRow}>
                  <DropdownInput
                    label="Branch"
                    options={branches.map((b) => ({
                      id: b.id,
                      name: b.branches_name,
                    }))}
                    valueKey="id"
                    nameKey="name"
                    value={(filters.branchId as string) || ""}
                    onChange={(e) => updateFilter("branchId", e.target.value)}
                    placeholder="All Branches"
                  />

                  <DropdownInput
                    label="Role"
                    options={roles.map((r) => ({
                      id: r.id,
                      name: r.role_name,
                    }))}
                    valueKey="id"
                    nameKey="name"
                    value={(filters.roleId as string) || ""}
                    onChange={(e) => updateFilter("roleId", e.target.value)}
                    placeholder="All Roles"
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
                    <p className={styles.statLabel}>Total Staff :</p>
                    <p className={styles.textDanger}>{totalRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Active Staff :</p>
                    <p className={styles.textSuccess}>{activeRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLabel}>Inactive Staff :</p>
                    <p className={styles.textDanger}>{inactiveRecords}</p>
                  </div>
                </div>
              </div>

              <hr className={styles.cuttingLine} />
              <p className={styles.lastEdited}>
                Last Edited : <span>{lastEditedBy}</span>
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
            <p className={styles.tableTitle}>EMPLOYEE MASTER RECORDS</p>

            <div className={styles.headerActionArea}>
              <NavigationBtn href="/staff/Addstaff" leftIcon={faPlus}>
                add staff
              </NavigationBtn>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={staffs}
            onRowClick={(staff) =>
              router.push(`/staff/Updatestaff/${staff.id}`)
            }
            emptyMessage="No staff records found."
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
          name="staff"
          id={deleteModal.id}
          apiRoute="master-company/staff"
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
