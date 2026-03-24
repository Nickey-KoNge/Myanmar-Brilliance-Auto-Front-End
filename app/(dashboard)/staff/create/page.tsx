"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBorderAll,
  faCalendar,
  faCamera,
  faCircleCheck,
  faPersonCircleExclamation,
  faShieldHalved,
  faPortrait,
  faUser,
  faIdCard,
  faLock,
  faPhone,
  faGlobe,
  faCity,
  faTimes,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import DropdownInput from "@/app/components/ui/SearchBoxes/DropdownInput";
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";

import styles from "./page.module.css";

const GENDERS = [
  { id: "Male", name: "Male" },
  { id: "Female", name: "Female" },
  { id: "Other", name: "Other" },
];

export default function CreateStaff() {
  const [preview, setPreview] = useState<string | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = "http://localhost:3001";
        const [rolesRes, branchesRes, companiesRes] = await Promise.all([
          fetch(`${baseUrl}/master-service/roles`).then((res) => res.json()),
          fetch(`${baseUrl}/master-company/branches`).then((res) => res.json()),
          fetch(`${baseUrl}/master-company/company`).then((res) => res.json()),
        ]);

        if (rolesRes.success) setRoles(rolesRes.data.data);
        if (branchesRes.success) setBranches(branchesRes.data.data);
        if (companiesRes.success) setCompanies(companiesRes.data.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]: any) => {
        if (key === "photo" && value?.[0]) {
          formData.append("image", value[0]);
        } else if (key === "dob" && value) {
          formData.append(key, new Date(value).toISOString());
        } else if (value) {
          formData.append(key, value);
        }
      });

      const response = await fetch(
        "http://localhost:3001/master-company/staff",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to save");
      }

      router.push("/staff");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const ActionButtons = (
    <div className={styles.headerActionArea}>
      <Link href="/staff" className={`${styles.btn} ${styles.btnCancel}`}>
        CANCEL
      </Link>
      <button
        type="submit"
        form="staffForm"
        disabled={loading}
        className={`${styles.btn} ${styles.btnSuccess}`}
      >
        <FontAwesomeIcon icon={faCircleCheck} />
        {loading ? "SAVING..." : "SAVE RECORD"}
      </button>
    </div>
  );

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faUser} />,
          text: "Staff Registration",
          description: "CREATE NEW EMPLOYEE RECORD",
        }}
        actionNode={ActionButtons}
      />

      <form
        id="staffForm"
        onSubmit={handleSubmit(onSubmit)}
        className={styles.formGridContainer}
      >
        {/* Section: Professional */}
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
              error={errors.role?.message as string}
              {...register("role", { required: "Role is required" })}
            />

            <DropdownInput
              label="Branch"
              placeholder="Select Branch"
              options={branches.map((b) => ({
                id: b.id,
                name: b.branches_name,
              }))}
              error={errors.branch?.message as string}
              {...register("branch", { required: "Branch is required" })}
            />

            <DropdownInput
              label="Company"
              placeholder="Select Company"
              options={companies.map((c) => ({
                id: c.id,
                name: c.company_name,
              }))}
              error={errors.company?.message as string}
              {...register("company", { required: "Company is required" })}
            />

            <TextInput
              label="Position"
              placeholder="e.g. Senior Manager"
              error={errors.position?.message as string}
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
              leftIcon={faUser}
              error={errors.staffName?.message as string}
              {...register("staffName", { required: "Staff Name is required" })}
            />

            <TextInput
              label="NRC Number"
              placeholder="12/MAMANA(N)123456"
              leftIcon={faIdCard}
              error={errors.nrc?.message as string}
              {...register("nrc", { required: "NRC is required" })}
            />

            <DateInput
              label="Date of Birth"
              error={errors.dob?.message as string}
              {...register("dob", { required: "DOB is required" })}
            />

            <DropdownInput
              label="Gender"
              placeholder="Select Gender"
              options={GENDERS}
              error={errors.gender?.message as string}
              {...register("gender", { required: "Gender is required" })}
            />
          </div>
        </section>

        {/* Section: Security */}
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
                  required: "A photo is required",
                  onChange: handleImageChange,
                })}
                hidden
              />
              <label htmlFor="photo" className={styles.imageUploadBox}>
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className={styles.previewImage}
                  />
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
            label="Secure Password"
            type="password"
            placeholder="••••••••"
            leftIcon={faLock}
            error={errors.password?.message as string}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Min 6 characters" },
            })}
          />
        </section>

        {/* Section: Contact */}
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
              leftIcon={faPhone}
              error={errors.phone?.message as string}
              {...register("phone", { required: "Phone is required" })}
            />

            <TextInput
              label="Email Address"
              placeholder="example@mail.com"
              leftIcon={faEnvelope}
              error={errors.email?.message as string}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
            />

            <TextInput
              label="Country"
              placeholder="Myanmar"
              leftIcon={faGlobe}
              {...register("country")}
            />

            <TextInput
              label="City"
              placeholder="Yangon"
              leftIcon={faCity}
              {...register("city")}
            />

            <TextInput
              label="Street Address"
              placeholder="No. (123), Street Name..."
              as="textarea"
              rows={3}
              error={errors.street_address?.message as string}
              {...register("street_address", {
                required: "Address is required",
              })}
            />
          </div>
        </section>
      </form>
    </>
  );
}
