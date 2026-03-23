"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCaretDown,
  faClockRotateLeft,
  faPlus,
  faTrashCan,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

// Components
import { Button } from "@/app/components/ui/Button/Button";
import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
//pagination components
import { Pagination } from "@/app/components/ui/Pagination/Pagination";

// Styles
import styles from "./page.module.css";
// Note: Ensure styles like .staffCell, .staffImg, and .deleteBtn
// are defined in your page.module.css or the DataTable.module.css

import { apiClient } from "@/app/features/lib/api-client";
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";
import DropdownInput from "@/app/components/ui/SearchBoxes/DropdownInput";

interface Staff {
  id: string;
  staffName: string;
  image: string;
  email: string;
  fullAddress: string;
  position: string;
  branches_name: string;
  phone: string;
  status: string;
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

interface PaginatedStaffResponse {
  data: Staff[] | { data: Staff[]; totalPages: number; total: number };
  total?: number;
  totalPages?: number;
  currentPage?: number;
}

export default function StaffPage() {
  const router = useRouter();
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  //for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const PAGE_SIZE = 1;

  // 1. Fetch Staff Data
  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const response = await apiClient.get(
          `/master-company/staff?page=${currentPage}&limit=${PAGE_SIZE}`,
        );

        const rawData = response as unknown as PaginatedStaffResponse;

        if (rawData && Array.isArray(rawData.data)) {
          setStaffs(rawData.data);
          setTotalPages(rawData.totalPages || 1);
          setTotalRecords(rawData.total || 0);
        } else if (
          rawData?.data &&
          typeof rawData.data === "object" &&
          Array.isArray(rawData.data)
        ) {
          setStaffs(rawData.data);
          setTotalPages(rawData.totalPages || 1);
          setTotalRecords(rawData.total || 0);
        } else {
          console.error("Data format issue:", rawData);
          setStaffs([]);
        }
      } catch (error) {
        console.error("Failed to fetch staff:", error);
      }
    };
    fetchStaffs();
  }, [currentPage]);

  // 2. Fetch Filters (Branches/Roles)
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

  // 3. Delete Handler
  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = confirm(`Delete ${name}?`);
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await apiClient.delete(`/master-company/staff/${id}`);
      setStaffs((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // 4. Table Column Definitions
  const columns = [
    {
      header: "Staff Info",
      key: "staffName",
      render: (staff: Staff) => (
        <div className={styles.staffInfo}>
          <Image
            src={staff.image || "/default-user.png"}
            alt={staff.staffName}
            width={40}
            height={40}
            unoptimized
            className={styles.staffImg}
          />
          {staff.staffName}
        </div>
      ),
    },
    { header: "Email", key: "email" },
    { header: "Address", key: "fullAddress" },
    { header: "Role", key: "position" },
    { header: "Branch", key: "branches_name" },
    { header: "Phone", key: "phone" },
    {
      header: "Actions",
      key: "actions",
      render: (staff: Staff) => (
        <button
          className={styles.deleteBtn}
          disabled={deletingId === staff.id}
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click trigger
            handleDelete(staff.id, staff.staffName);
          }}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      ),
    },
  ];

  const renderLiveButtonArea = (
    <div className={styles.headerActionArea}>
      <Link href="/staff/create" className={styles.headerbarButton}>
        <FontAwesomeIcon icon={faPlus} />
        ADD STAFF
      </Link>
    </div>
  );

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faUser} />,
          text: "Staff Management",
        }}
        actionNode={renderLiveButtonArea}
      />

      <div className={styles.gridContainer}>
        {/* Main Content: Table Section */}
        <section className={styles.gridBox}>
          <div className={styles.spacer}>
            <div>
              <p className={styles.gridBoxTitle}>EMPLOYEE MASTER RECORDS</p>

              <DataTable
                columns={columns}
                data={staffs}
                onRowClick={(staff) => router.push(`/staff/update/${staff.id}`)}
                emptyMessage="No staff records found."
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={PAGE_SIZE}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </section>

        {/* Sidebar: Search & Filters */}
        <aside className={styles.gridBox}>
          <p className={styles.gridBoxTitle}>Employee Search</p>
          <hr className={styles.cuttingLine} />

          <div className={styles.searchContainer}>
            {/* Text Search Component */}
            <TextInput
              label="Searching"
              placeholder="Search by name, email..."
              // value={search}
              // onChange={(e) => setSearch(e.target.value)}
              name="search"
            />

            {/* Date Search Component */}
            <div className={styles.filterRow}>
              <DateInput
                label="From"
                // value={date}
                // onChange={(val) => setDate(val)}
                rightIcon={faCalendarDays}
              />

              <DateInput
                label="To"
                // value={date}
                // onChange={(val) => setDate(val)}
                rightIcon={faCalendarDays}
              />
            </div>

            <div className={styles.filterRow}>
              <DropdownInput
                label="Branch"
                options={branches.map((option) => ({
                  id: option.id,
                  name: option.branches_name,
                }))}
                valueKey="id"
                nameKey="name"
                defaultValue="all"
              />

              <DropdownInput
                label="Role"
                options={roles.map((option) => ({
                  id: option.id,
                  name: option.role_name,
                }))}
                valueKey="id"
                nameKey="name"
                defaultValue="all"
              />
            </div>

            <div className={styles.btnBox}>
              <Button className={styles.resetBtn}>Reset Filters</Button>
            </div>

            <hr className={styles.cuttingLine} />

            <div className={styles.recentRecord}>
              <span>
                {" "}
                <FontAwesomeIcon icon={faClockRotateLeft} />
              </span>
              <p className={styles.recentTitle}>RECENT RECORD</p>
              <span />
              <div className={styles.stat}>
                <div>
                  <p className={styles.statLable}>Total Staff :</p>
                  <p className={styles.textDanger}>{totalRecords}</p>
                </div>
                <div>
                  {" "}
                  <p className={styles.statLable}>Active Staff :</p>
                  <p className={styles.textSuccess}>36</p>{" "}
                </div>{" "}
                <div>
                  <p className={styles.statLable}>Inactive Staff :</p>
                  <p className={styles.textDanger}>4</p>{" "}
                </div>{" "}
              </div>{" "}
            </div>

            <hr className={styles.cuttingLine} />
            <p className={styles.lastEdited}>
              Last Edited :{" "}
              <span className={styles.spanText}>Nickey (Admin)</span>
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
