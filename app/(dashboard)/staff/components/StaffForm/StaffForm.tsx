"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBorderAll,
  faCamera,
  faCircleCheck,
  faPersonCircleExclamation,
  faShieldHalved,
  faPortrait,
  faUser,
  faIdCard,
  faLock,
  faPhone,
  faEnvelope,
  faGlobe,
  faCity,
  faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";

import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import DropdownInput from "@/app/components/ui/SearchBoxes/DropdownInput";
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";

import styles from "./page.module.css";
import { apiClient } from "@/app/features/lib/api-client";

const GENDERS = [
  { id: "Male", name: "Male" },
  { id: "Female", name: "Female" },
];

// Type Definitions
interface Role {
  id: string;
  role_name: string;
}

interface Branch {
  id: string;
  branches_name: string;
}

interface Company {
  id: string;
  company_name: string;
}

export interface StaffFormData {
  role: string;
  branch: string;
  company: string;
  position: string;
  staffName: string;
  nrc: string;
  dob: string;
  gender: string;
  photo?: FileList;
  password?: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  street_address: string;
  image?: string;
}

interface StaffFormProps {
  mode: "create" | "update";
  initialData?: Partial<StaffFormData>;
  onSubmit: SubmitHandler<StaffFormData>;
  loading?: boolean;
}

export const StaffForm: React.FC<StaffFormProps> = ({
  mode,
  initialData,
  onSubmit,
  loading = false,
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffFormData>({
    mode: "onTouched",
    defaultValues: initialData || {},
  });

  // Handle Initial Data Binding (For Update)
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.image) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreview(initialData.image);
      }
    }
  }, [initialData, reset]);

  // Fetch Dropdown Options
useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [rolesRes, branchesRes, companiesRes] = await Promise.all([
          apiClient.get("/master-service/roles"),
          apiClient.get("/master-company/branches"),
          apiClient.get("/master-company/company"),
        ]);

        const rolesData = (
          (rolesRes as { data?: { data?: Role[] } })?.data?.data ||
          (rolesRes as { data?: Role[] })?.data ||
          []
        ) as Role[];

        const branchesData = (
          (branchesRes as { data?: { data?: Branch[] } })?.data?.data ||
          (branchesRes as { data?: Branch[] })?.data ||
          []
        ) as Branch[];

        const companiesData = (
          (companiesRes as { data?: { data?: Company[] } })?.data?.data ||
          (companiesRes as { data?: Company[] })?.data ||
          []
        ) as Company[];

        setRoles(rolesData);
        setBranches(branchesData);
        setCompanies(companiesData);
      } catch (err) {
        console.error("Error fetching form options:", err);
      }
    };
    fetchOptions();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faUser} />,
          text: mode === "create" ? "Staff Registration" : "Staff Update",
          description:
            mode === "create"
              ? "CREATE NEW EMPLOYEE RECORD"
              : "EDIT EMPLOYEE RECORD",
        }}
        actionNode={
          <div className={styles.headerActionArea}>
            <NavigationBtn href="/staff" variant="cancel">
              cancel
            </NavigationBtn>
            <ActionBtn
              type="submit"
              variant="action"
              leftIcon={mode === "create" ? faCircleCheck : faArrowsRotate }
              form="staffForm"
              loading={loading}
            >
              {mode === "create" ? "save record" : "update record"}
            </ActionBtn>
          </div>
        }
      />

      <form
        id="staffForm"
        onSubmit={handleSubmit(onSubmit)}
        className={styles.formGridContainer}
      >
        {/* Section: Professional Assignment */}
        <section className={styles.formGridBox}>
          <header className={styles.gridBoxTitle}>
            <span className={styles.pill} />
            <FontAwesomeIcon icon={faBorderAll} className={styles.textDanger} />
            PROFESSIONAL ASSIGNMENT
          </header>
          <hr className={styles.cuttingLine} />

          <div className={styles.filterContainer}>
            <DropdownInput
              label="Role"
              placeholder="Select Role"
              options={roles.map((r) => ({ id: r.id, name: r.role_name }))}
              error={errors.role?.message}
              {...register("role", { required: "Role is required" })}
            />
            <DropdownInput
              label="Branch"
              placeholder="Select Branch"
              options={branches.map((b) => ({
                id: b.id,
                name: b.branches_name,
              }))}
              error={errors.branch?.message}
              {...register("branch", { required: "Branch is required" })}
            />
            <DropdownInput
              label="Company"
              placeholder="Select Company"
              options={companies.map((c) => ({
                id: c.id,
                name: c.company_name,
              }))}
              error={errors.company?.message}
              {...register("company", { required: "Company is required" })}
            />
            <TextInput
              label="Position"
              placeholder="e.g. Senior Manager"
              error={errors.position?.message}
              {...register("position", { required: "Position is required" })}
            />
          </div>
        </section>

        {/* Section: Core Identity */}
        <section className={styles.formGridBox}>
          <header className={styles.gridBoxTitle}>
            <span className={styles.pill} />
            <FontAwesomeIcon
              icon={faPersonCircleExclamation}
              className={styles.textDanger}
            />
            CORE IDENTITY
          </header>
          <hr className={styles.cuttingLine} />

          <div className={styles.filterContainer}>
            <TextInput
              label="Staff Name"
              placeholder="Enter Full Name"
              rightIcon={faUser}
              error={errors.staffName?.message}
              {...register("staffName", { required: "Staff Name is required" })}
            />
            <TextInput
              label="NRC Number"
              placeholder="12/MAMANA(N)123456"
              rightIcon={faIdCard}
              error={errors.nrc?.message}
              {...register("nrc", { required: "NRC is required" })}
            />
            <DateInput
              label="Date of Birth"
              error={errors.dob?.message}
              {...register("dob", { required: "DOB is required" })}
            />
            <DropdownInput
              label="Gender"
              placeholder="Select Gender"
              options={GENDERS}
              error={errors.gender?.message}
              {...register("gender", { required: "Gender is required" })}
            />
          </div>
        </section>

        {/* Section: Security & Photo */}
        <section className={styles.formGridBox}>
          <header className={styles.gridBoxTitle}>
            <span className={styles.pill} />
            <FontAwesomeIcon
              icon={faShieldHalved}
              className={styles.textDanger}
            />
            SECURITY & PHOTO
          </header>
          <hr className={styles.cuttingLine} />

          <div className={styles.imageUploadSection}>
            <div className={styles.imageUploadWrapper}>
              <input
                type="file"
                accept="image/*"
                id="photo"
                {...register("photo", {
                  required: mode === "create" ? "A photo is required" : false,
                  onChange: handleImageChange,
                })}
                hidden
              />
              <label htmlFor="photo" className={styles.imageUploadBox}>
                {preview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Preview"
                      className={styles.previewImage}
                    />
                  </>
                ) : (
                  <FontAwesomeIcon
                    icon={faUser}
                    className={styles.defaultIcon}
                  />
                )}
                <div className={styles.cameraButton}>
                  <FontAwesomeIcon icon={faCamera} />
                </div>
              </label>
              {errors.photo && (
                <p className={styles.error}>{errors.photo.message as string}</p>
              )}
            </div>
          </div>

          <TextInput
            label={mode === "create" ? "Secure Password" : "New Password"}
            type="password"
            placeholder={
              mode === "create"
                ? "••••••••"
                : "Leave blank to keep old password"
            }
            rightIcon={faLock}
            error={errors.password?.message}
            {...register("password", {
              required: mode === "create" ? "Password is required" : false,
              minLength: { value: 6, message: "Min 6 characters" },
            })}
          />
        </section>

        {/* Section: Contact Details */}
        <section className={styles.formGridBox}>
          <header className={styles.gridBoxTitle}>
            <span className={styles.pill} />
            <FontAwesomeIcon icon={faPortrait} className={styles.textDanger} />
            CONTACT DETAILS
          </header>
          <hr className={styles.cuttingLine} />

          <div className={styles.filterContainer}>
            <TextInput
              label="Phone Number"
              placeholder="+95 9..."
              rightIcon={faPhone}
              error={errors.phone?.message}
              {...register("phone", { required: "Phone is required" })}
            />
            <TextInput
              label="Email Address"
              placeholder="example@mail.com"
              rightIcon={faEnvelope}
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
            />
            <TextInput
              label="Country"
              placeholder="Myanmar"
              rightIcon={faGlobe}
              {...register("country")}
            />
            <TextInput
              label="City"
              placeholder="Yangon"
              rightIcon={faCity}
              {...register("city")}
            />
            <TextInput
              label="Street Address"
              placeholder="No. (123), Street Name..."
              as="textarea"
              rows={3}
              error={errors.street_address?.message}
              {...register("street_address", {
                required: "Address is required",
              })}
            />
          </div>
        </section>
      </form>
    </>
  );
};
