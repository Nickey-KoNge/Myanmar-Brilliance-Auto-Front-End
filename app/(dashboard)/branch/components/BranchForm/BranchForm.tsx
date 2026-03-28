"use client";
import { Input } from "@/app/components/ui/Input/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCodeBranch,
  faUser,
  faMapLocation,
  faCircleCheck,
  faTable,
  faIdCard,
  faLocationDot,
  faPhone,
  faMapPin,
  faAddressBook,
  faCity,
  faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
// import { Button } from "@/app/components/ui/Button/Button";
import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import styles from "./page.module.css";
import dynamic from "next/dynamic";
import DropdownInput from "@/app/components/ui/SearchBoxes/DropdownInput";

import { FormCard } from "@/app/components/ui/FormCard/FormCard";
import { apiClient } from "@/app/features/lib/api-client";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";

const MapPicker = dynamic(
  () => import("../../../../components/ui/MapPicker/MapPicker"),
  {
    ssr: false,
  },
);

interface FormData {
  branches_name: string;
  gps_location: string;
  phone: string;
  division: string;
  city: string;
  address: string;
  description: string;
  company_id: string;
  id: string;
  staff: string;
  stations: string;
  company: string;
}

interface Company {
  id: string;
  company_name: string;
}

interface BranchFormProps {
  mode: "create" | "update";
  initialData?: FormData;
  onSubmit: SubmitHandler<FormData>;
  loading?: boolean;
}

export const BranchForm: React.FC<BranchFormProps> = ({
  mode,
  initialData,
  onSubmit,
  loading = false,
}) => {
  const {
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: initialData || { company_id: "" },
  });
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiClient.get("/master-company/company");

        const result = response as { data?: Company[] | { data?: Company[] } };

        console.log("Fetched Companies:", result);

        if (result && Array.isArray(result.data)) {
          setCompanies(result.data);
        } else if (result && result.data && Array.isArray(result.data)) {
          setCompanies(result.data);
        } else {
          setCompanies([]);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  console.log("Companies list", companies);

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faCodeBranch} />,
          text: mode === "create" ? "Branch Registration" : "Update Branch",
          description:
            mode === "create"
              ? "Create New Branches Records"
              : "Update Existing Branch",
        }}
        actionNode={
          <div className={styles.headerActionArea}>
            <NavigationBtn href="/branch" variant="cancel">
              cancel
            </NavigationBtn>
            <ActionBtn
              type="submit"
              variant="action"
              leftIcon={mode === "create" ? faCircleCheck : faArrowsRotate}
              form="branchForm"
              loading={loading}
            >
              {mode === "create" ? "save record" : "update record"}
            </ActionBtn>
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
          <FormCard title="Professional Assignment" icon={faTable}>
            <div className={styles.fieldGroup}>
              <DropdownInput
                label="Company"
                placeholder="Select Company"
                options={companies.map((c) => ({
                  id: c.id,
                  name: c.company_name,
                }))}
                {...register("company_id")}
              />
            </div>
          </FormCard>

          {/* RIGHT — Core Identity */}
          <FormCard title="Core Identity Attributes" icon={faIdCard}>
            <div className={styles.row}>
              <Input
                label="BRANCHE NAME"
                type="text"
                placeholder="Enter Your Branches Name..."
                icon={<FontAwesomeIcon icon={faUser} />}
                error={errors.branches_name?.message}
                {...register("branches_name", {
                  required: "Branch name is required",
                })}
              />
              <Input
                readOnly
                label="GPS LOCATION"
                type="text"
                placeholder="Enter Your GPS Location..."
                icon={<FontAwesomeIcon icon={faMapLocation} />}
                error={errors.gps_location?.message}
                {...register("gps_location", {
                  required: "GPS location is required",
                })}
              />
            </div>

            <Input
              label="DESCRIPTION"
              placeholder="Enter Your Description...."
              error={errors.description?.message}
              {...register("description", {
                required: "Description is required",
              })}
            />
          </FormCard>

          {/* LEFT — Location Map */}
          <FormCard title="Location Map" icon={faLocationDot}>
            <div className={styles.mapPlaceholder}>
              <MapPicker setValue={setValue} />
            </div>
          </FormCard>

          {/* RIGHT — Contact & Address Details */}
          <FormCard title="Contact & Address Details" icon={faAddressBook}>
            <div className={styles.row}>
              <Input
                label="PHONE NUMBER"
                type="text"
                placeholder="+95 9 xxx xxx xxx"
                icon={<FontAwesomeIcon icon={faPhone} />}
                error={errors.phone?.message}
                {...register("phone", {
                  required: "Phone number is required",
                })}
              />

              <Input
                label="DIVISION"
                type="text"
                placeholder="Enter Division..."
                icon={<FontAwesomeIcon icon={faMapPin} />}
                error={errors.division?.message}
                {...register("division", {
                  required: "Division is required",
                })}
              />
            </div>

            <Input
              label="CITY"
              type="text"
              placeholder="City"
              icon={<FontAwesomeIcon icon={faCity} />}
              error={errors.city?.message}
              {...register("city", { required: "City is required" })}
            />

            <div className={styles.fieldGroup}>
              <label className={styles.textareaLabel}>Street Address</label>
              <textarea
                className={styles.textarea}
                placeholder="Enter Your Address...."
                {...register("address", { required: "Address is required" })}
              />
            </div>
          </FormCard>
        </div>
      </form>
    </>
  );
};
