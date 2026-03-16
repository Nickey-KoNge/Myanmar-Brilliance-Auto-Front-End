"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCodeBranch,
  faIdCard,
  faMap,
  faMapLocation,
  faPhone,
  faAddressBook,
  faCity,
  faDivide,
  faTable,
  faCircleCheck,
  faUser,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/app/components/ui/Button/Button";
import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import { Input } from "@/app/components/ui/Input/Input";
import styles from "../../Addbranch/page.module.css";

interface FormData {
  branches_name: string;
  gps_location: string;
  phone: string;
  division: string;
  city: string;
  address: string;
  description: string;
  company_id: string;
}

interface Company {
  id: string;
  company_name: string;
}

export default function UpdateBranch() {
  const { id } = useParams();
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/master-company/branches/${id}`,
        );
        const result = await response.json();
        console.log("Branch Data:", result.data);
        if (result && result.data) {
          reset({
            ...result.data,

            company_id: result.data.company?.id || "",
          });
          setCompanies((prevCompanies) => {
            const currentCompany = result.data.company;
            if (
              currentCompany &&
              !prevCompanies.some((c) => c.id === currentCompany.id)
            ) {
              return [...prevCompanies, currentCompany];
            }
            return prevCompanies;
          });
        }
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranchData();
  }, [id, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const response = await fetch(
        `http://localhost:3001/master-company/branches/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error: ${response.status} - ${errorDetails}`);
      }
    } catch (error) {
      console.error("Error updating branch data:", error);
    }
  };

  const actionButtons = (
    <div style={{ display: "flex", gap: "10px", width: "400px" }}>
      <Button
        type="button"
        style={{
          background: "#1a1a1a",
          color: "white",
          border: "1px solid #333",
        }}
      >
        CANCEL
      </Button>
      <Button type="submit" form="branchForm">
        <FontAwesomeIcon icon={faCircleCheck} />
        UPDATE RECORD
      </Button>
    </div>
  );

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faCodeBranch} />,
          text: "Branch Registration",
          description: "Create New Branches Records",
        }}
        actionNode={actionButtons}
      />

      <form
        id="branchForm"
        onSubmit={handleSubmit(onSubmit)}
        className={styles.page}
      >
        <div className={styles.grid}>
          {/* LEFT — Professional Assignment */}
          <div className={styles.card}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionBar} />
              <div className={styles.sectionIcon}>
                <FontAwesomeIcon icon={faTable} />
              </div>
              <span className={styles.sectionTitle}>
                Professional Assignment
              </span>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Company</label>
              <select
                className={styles.select}
                {...register("company_id", { required: true })}
              >
                <option value="">All Company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* RIGHT — Core Identity */}
          <div className={styles.card}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionBar} />
              <div className={styles.sectionIcon}>
                <FontAwesomeIcon icon={faIdCard} />
              </div>
              <span className={styles.sectionTitle}>
                Core Identity Attributes
              </span>
            </div>

            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Branch Name</label>
                <Input
                  label=""
                  type="text"
                  placeholder="Enter Your Branches Name..."
                  icon={<FontAwesomeIcon icon={faUser} />}
                  {...register("branches_name", { required: true })}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>GPS Location</label>
                <Input
                  label=""
                  type="text"
                  placeholder="Enter Your GPS Location..."
                  icon={<FontAwesomeIcon icon={faMapLocation} />}
                  {...register("gps_location", { required: true })}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Description</label>
              <Input
                label=""
                placeholder="Enter Your Description...."
                {...register("description", { required: true })}
              />
            </div>
          </div>

          {/* LEFT — Location Map */}
          <div className={styles.card}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionBar} />
              <div className={styles.sectionIcon}>
                <FontAwesomeIcon icon={faLocationDot} />
              </div>
              <span className={styles.sectionTitle}>Location Map</span>
            </div>

            <div className={styles.mapPlaceholder}>
              <FontAwesomeIcon icon={faMap} />
            </div>
          </div>

          {/* RIGHT — Contact & Address Details */}
          <div className={styles.card}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionBar} />
              <div className={styles.sectionIcon}>
                <FontAwesomeIcon icon={faAddressBook} />
              </div>
              <span className={styles.sectionTitle}>
                Contact & Address Details
              </span>
            </div>

            {/* Phone + Division row */}
            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Phone Number</label>
                <Input
                  label=""
                  type="text"
                  placeholder="+95 9 xxx xxx xxx"
                  icon={<FontAwesomeIcon icon={faPhone} />}
                  {...register("phone", { required: true })}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Division</label>
                <Input
                  label=""
                  type="text"
                  placeholder="Enter Division..."
                  icon={<FontAwesomeIcon icon={faDivide} />}
                  {...register("division", { required: true })}
                />
              </div>
            </div>

            {/* City */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>City</label>
              <Input
                label=""
                type="text"
                placeholder="city"
                icon={<FontAwesomeIcon icon={faCity} />}
                {...register("city", { required: true })}
              />
            </div>

            {/* Street Address */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Street Address</label>
              <textarea
                className={styles.textarea}
                placeholder="Enter Your Address...."
                {...register("address", { required: true })}
              />
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
