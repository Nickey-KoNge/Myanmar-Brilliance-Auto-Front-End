'use client';
import { Input } from '@/app/components/ui/Input/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCodeBranch,
  faUser,
  faMapLocation,
  faCircleCheck,
  faTable,
  faIdCard,
  faLocationDot,
  faMap,
  faPhone,
  faMapPin,
  faAddressBook,
  faCity,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/app/components/ui/Button/Button";
import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import styles from "./page.module.css";
import dynamic from 'next/dynamic';

const MapPicker=dynamic(()=>import("../MapPicker/MapPicker"),{
  ssr:false,
})


interface FormData {
  branches_name: string;
  gps_location: string;
  phone: string;
  division: string;
  city: string;
  address: string;
  description: string;
  company_id: string;
  id:string;
  staff:string;
  stations:string;
  company:string;
}

interface Company {
  id: string;
  company_name: string;
}

interface BranchFormProps {
  mode: "create" | "update";
  initialData?: FormData;
  onSubmit: SubmitHandler<FormData>;
}

export const BranchForm: React.FC<BranchFormProps> = ({ mode, initialData, onSubmit }) => {
  const { register,setValue, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: initialData || {company_id:""},
  });
  const [companies, setCompanies] = useState<Company[]>([]);



  // Reset form with initial data change  
  //   useEffect(() => {
  //   reset(initialData);
  // }, [initialData, reset]);


  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("http://localhost:3001/master-company/company");
        const result = await response.json();
        if (result && Array.isArray(result.data)) setCompanies(result.data);

      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  console.log("Companies list",companies);

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faCodeBranch} />,
          text: mode === "create" ? "Branch Registration" : "Update Branch",
          description: mode === "create" ? "Create New Branches Records" : "Update Existing Branch",
        }}
        actionNode={
          <div style={{ display: "flex", gap: "10px", width: "400px" }}>
            <Button
              type="button"
              style={{
                background: "#1a1a1a",
                color: "white",
                border: "1px solid #333",
              }}
              onClick={() => window.history.back()}
            >
              CANCEL
            </Button>
            <Button type="submit" form="branchForm">
              <FontAwesomeIcon icon={faCircleCheck} />
              {mode === "create" ? "SAVE RECORD" : "UPDATE RECORD"}
            </Button>
          </div>
        }
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
                {...register("company_id")}
              
               
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
                  {...register("branches_name", { required: "Branch name is required" })}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>GPS Location</label>
                <Input
                  label=""
                  type="text"
                  placeholder="Enter Your GPS Location..."
                  icon={<FontAwesomeIcon icon={faMapLocation} />}
                  {...register("gps_location", { required: "GPS location is required" })}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Description</label>
              <Input
                label=""
                placeholder="Enter Your Description...."
                {...register("description", { required: "Description is required" })}
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
              {/* <FontAwesomeIcon icon={faMap} /> */}
              <MapPicker setValue={setValue}/>
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
                  {...register("phone", { required: "Phone number is required" })}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Division</label>
                <Input
                  label=""
                  type="text"
                  placeholder="Enter Division..."
                  icon={<FontAwesomeIcon icon={faMapPin} />}
                  {...register("division", { required: "Division is required" })}
                />
              </div>
            </div>
       

             {/* City */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>City</label>
              <Input
                label=""
                type="text"
                placeholder="City"
                icon={<FontAwesomeIcon icon={faCity} />}
                {...register("city", { required: "City is required" })}
              />
            </div>
     

            {/* Street Address */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Street Address</label>
              <textarea
                className={styles.textarea}
                placeholder="Enter Your Address...."
                {...register("address", { required: "Address is required" })}
              />
            </div>
        </div>

        </div>
      </form>
    </>
  );
};