// app/(dashboard)/staff/[id]/edit/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBorderAll,
  faCalendar,
  faCamera,
  faCaretDown,
  faCircleCheck,
  faCity,
  faGlobe,
  faIdCard,
  faLock,
  faPersonCircleExclamation,
  faPhone,
  faPortrait,
  faShieldHalved,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import { Input } from "@/app/components/ui/Input/Input";
import styles from "../../create/page.module.css"; // reuse the same CSS

const GENDERS = ["Male", "Female"];

export default function EditStaff() {
  const { id } = useParams();
  const router = useRouter();

  const [preview, setPreview] = useState<string | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // loading existing data

  const {
    register,
    handleSubmit,
    reset, // ← key difference: used to pre-fill the form
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  // 1. Fetch dropdowns + existing staff data in parallel
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [r, b, c, staff] = await Promise.all([
          fetch("http://localhost:3001/master-service/roles").then((res) =>
            res.json(),
          ),
          fetch("http://localhost:3001/master-company/branches").then((res) =>
            res.json(),
          ),
          fetch("http://localhost:3001/master-company/company").then((res) =>
            res.json(),
          ),
          fetch(`http://localhost:3001/master-company/staff/${id}`).then(
            (res) => res.json(),
          ),
        ]);

        if (r.success) setRoles(r.data.data);
        if (b.success) setBranches(b.data.data);
        if (c.success) setCompanies(c.data.data);

        if (staff.success) {
          const s = staff.data;

          // Pre-fill all form fields with existing values
          reset({
            role: s.role,
            branch: s.branch,
            company: s.company,
            position: s.position,
            staffName: s.staffName,
            nrc: s.nrc,
            // Format ISO date string → "YYYY-MM-DD" for the date input
            dob: s.dob ? s.dob.split("T")[0] : "",
            gender: s.gender,
            phone: s.phone,
            country: s.country,
            city: s.city,
            email: s.email,
            street_address: s.street_address,
            // password intentionally left blank for security
          });

          // Show existing photo as preview if available
          if (s.photo_url) setPreview(s.photo_url);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchAll();
  }, [id, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  // 2. Submit — PATCH instead of POST, photo only sent if changed
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]: any) => {
        if (key === "photo") {
          // Only attach a new file if the user actually picked one
          if (value?.[0]) formData.append("image", value[0]);
        } else if (key === "password") {
          // Only send password if the user typed something
          if (value) formData.append("password", value);
        } else if (key === "dob") {
          if (value) formData.append(key, new Date(value).toISOString());
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      const response = await fetch(
        `http://localhost:3001/master-company/staff/${id}`,
        {
          method: "PATCH", // or "PUT" depending on your API
          body: formData,
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to update");
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
        disabled={loading || fetching}
        className={`${styles.btn} ${styles.btnSuccess}`}
      >
        <FontAwesomeIcon icon={faCircleCheck} />
        {loading ? "UPDATING..." : "UPDATE RECORD"}
      </button>
    </div>
  );

  // Show a loading state while fetching existing data
  if (fetching) return <p style={{ padding: "2rem" }}>Loading staff data…</p>;

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faUser} />,
          text: "Staff Update",
          description: "EDIT EMPLOYEE RECORD",
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
            <div className={styles.filterItem}>
              <label className={styles.inputLabel}>Role</label>
              <div className={styles.inputWrapper}>
                <select {...register("role", { required: "Role is required" })}>
                  <option value="" disabled>
                    Select Role
                  </option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.role_name}
                    </option>
                  ))}
                </select>
                <FontAwesomeIcon
                  icon={faCaretDown}
                  className={styles.inputIcon}
                />
              </div>
              {errors.role && (
                <p className={styles.errorMsg}>
                  {errors.role.message as string}
                </p>
              )}
            </div>

            <div className={styles.filterItem}>
              <label className={styles.inputLabel}>Branch</label>
              <div className={styles.inputWrapper}>
                <select
                  {...register("branch", { required: "Branch is required" })}
                >
                  <option value="" disabled>
                    Select Branch
                  </option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branches_name}
                    </option>
                  ))}
                </select>
                <FontAwesomeIcon
                  icon={faCaretDown}
                  className={styles.inputIcon}
                />
              </div>
              {errors.branch && (
                <p className={styles.errorMsg}>
                  {errors.branch.message as string}
                </p>
              )}
            </div>

            <div className={styles.filterItem}>
              <label className={styles.inputLabel}>Company</label>
              <div className={styles.inputWrapper}>
                <select
                  {...register("company", { required: "Company is required" })}
                >
                  <option value="" disabled>
                    Select Company
                  </option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
                <FontAwesomeIcon
                  icon={faCaretDown}
                  className={styles.inputIcon}
                />
              </div>
              {errors.company && (
                <p className={styles.errorMsg}>
                  {errors.company.message as string}
                </p>
              )}
            </div>

            <Input
              label="Position"
              placeholder="Position"
              icon={<FontAwesomeIcon icon={faUser} />}
              {...register("position", { required: "Position is required" })}
            />
          </div>
        </section>

        {/* Section: Identity */}
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
            <Input
              label="Staff Name"
              placeholder="Enter Name"
              icon={<FontAwesomeIcon icon={faUser} />}
              {...register("staffName", { required: "Staff Name is required" })}
            />
            <Input
              label="NRC"
              placeholder="Enter NRC"
              icon={<FontAwesomeIcon icon={faIdCard} />}
              {...register("nrc", { required: "NRC is required" })}
            />

            <div className={styles.filterItem}>
              <label className={styles.inputLabel}>Date of Birth</label>
              <div className={styles.inputWrapper}>
                <input
                  type="date"
                  {...register("dob", { required: "DOB is required" })}
                />
                <FontAwesomeIcon
                  icon={faCalendar}
                  className={styles.inputIcon}
                />
              </div>
              {errors.dob && (
                <p className={styles.errorMsg}>
                  {errors.dob.message as string}
                </p>
              )}
            </div>

            <div className={styles.filterItem}>
              <label className={styles.inputLabel}>Gender</label>
              <div className={styles.inputWrapper}>
                <select
                  {...register("gender", { required: "Gender is required" })}
                >
                  <option value="">Choose Gender</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <FontAwesomeIcon
                  icon={faCaretDown}
                  className={styles.inputIcon}
                />
              </div>
              {errors.gender && (
                <p className={styles.errorMsg}>
                  {errors.gender.message as string}
                </p>
              )}
            </div>
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
                {...register("photo", { onChange: handleImageChange })}
                // Not required on update — existing photo stays if none selected
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
            </div>
          </div>

          <Input
            label="NEW PASSWORD (leave blank to keep current)"
            type="password"
            icon={<FontAwesomeIcon icon={faLock} />}
            {...register("password", {
              minLength: { value: 6, message: "Min 6 characters" },
              // Not required on update
            })}
            placeholder="Leave blank to keep current password"
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
            <Input
              label="Phone"
              placeholder="Phone"
              icon={<FontAwesomeIcon icon={faPhone} />}
              {...register("phone", { required: "Phone is required" })}
            />
            <Input
              label="Country"
              placeholder="Country"
              icon={<FontAwesomeIcon icon={faGlobe} />}
              {...register("country")}
            />
            <Input
              label="City"
              placeholder="City"
              icon={<FontAwesomeIcon icon={faCity} />}
              {...register("city")}
            />
            <Input
              label="Email"
              placeholder="Email"
              icon={<FontAwesomeIcon icon={faUser} />}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
            />

            <div className={styles.filterItem}>
              <label className={styles.inputLabel}>Street Address</label>
              <div className={styles.inputWrapper}>
                <textarea
                  {...register("street_address", {
                    required: "Address is required",
                  })}
                  rows={5}
                  placeholder="Address"
                />
              </div>
              {errors.street_address && (
                <p className={styles.errorMsg}>
                  {errors.street_address.message as string}
                </p>
              )}
            </div>
          </div>
        </section>
      </form>
    </>
  );
}
