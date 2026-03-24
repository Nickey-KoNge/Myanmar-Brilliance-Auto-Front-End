"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBorderAll,
  faCamera,
  faCircleCheck,
  faPersonCircleExclamation,
  faShieldHalved,
  faPortrait,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import DropdownInput from "@/app/components/ui/SearchBoxes/DropdownInput";
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";

import styles from "../../create/page.module.css";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";

const GENDERS = [
  { id: "Male", name: "Male" },
  { id: "Female", name: "Female" },
];

export default function EditStaff() {
  const { id } = useParams();
  const router = useRouter();

  const [preview, setPreview] = useState<string | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Store raw staff data separately so we can reset the form
  // only AFTER options are populated in state
  const [staffData, setStaffData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  // Step 1: Fetch all data (options + staff record)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, branchesRes, companiesRes, staffRes] =
          await Promise.all([
            fetch("http://localhost:3001/master-service/roles").then((r) =>
              r.json(),
            ),
            fetch("http://localhost:3001/master-company/branches").then((r) =>
              r.json(),
            ),
            fetch("http://localhost:3001/master-company/company").then((r) =>
              r.json(),
            ),
            fetch(`http://localhost:3001/master-company/staff/${id}`).then(
              (r) => r.json(),
            ),
          ]);

        setRoles(rolesRes.data?.data || []);
        setBranches(branchesRes.data?.data || []);
        setCompanies(companiesRes.data?.data || []);

        if (staffRes.success) {
          setStaffData(staffRes.data);
          console.log(staffRes.data);
          if (staffRes.data.image) setPreview(staffRes.data.image);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (
      !staffData ||
      roles.length === 0 ||
      branches.length === 0 ||
      companies.length === 0
    ) {
      return;
    }

    const s = staffData;

    reset({
      role: s.role_id ?? s.role?.id ?? s.role ?? "",
      branch: s.branch_id ?? s.branch?.id ?? s.branch ?? "",
      company: s.company_id ?? s.company?.id ?? s.company ?? "",
      position: s.position ?? "",
      staffName: s.staffName ?? "",
      nrc: s.nrc ?? "",
      dob: s.dob ? s.dob.split("T")[0] : "",
      gender: s.gender ?? "",
      phone: s.phone ?? "",
      email: s.email ?? "",
      country: s.country ?? "",
      city: s.city ?? "",
      street_address: s.street_address ?? "",
    });
  }, [staffData, roles, branches, companies, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]: any) => {
        if (key === "photo") {
          if (value?.[0]) formData.append("image", value[0]);
        } else if (key === "password") {
          if (value) formData.append("password", value);
        } else if (key === "dob" && value) {
          formData.append(key, new Date(value).toISOString());
        } else if (value !== "" && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await fetch(
        `http://localhost:3001/master-company/staff/${id}`,
        { method: "PATCH", body: formData },
      );

      if (!response.ok) throw new Error("Update failed");
      router.push("/staff");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div>Loading record...</div>;

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faUser} />,
          text: "Staff Update",
          description: "EDIT EMPLOYEE RECORD",
        }}
        actionNode={
          <div className={styles.headerActionArea}>
            <NavigationBtn href="/staff" variant="cancel">
              CANCEL
            </NavigationBtn>
            <ActionBtn
              variant="action"
              type="submit"
              leftIcon={faCircleCheck}
              form="staffForm"
            >
              UPDATE RECORD
            </ActionBtn>
          </div>
        }
      />

      <form
        id="staffForm"
        onSubmit={handleSubmit(onSubmit)}
        className={styles.formGridContainer}
      >
        {/* PROFESSIONAL ASSIGNMENT */}
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
              placeholder="Position"
              {...register("position")}
            />
          </div>
        </section>

        {/* CORE IDENTITY */}
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
              {...register("staffName", { required: "Required" })}
            />
            <TextInput
              label="NRC Number"
              {...register("nrc", { required: "Required" })}
            />
            <DateInput
              label="Date of Birth"
              {...register("dob", { required: "Required" })}
            />
            <DropdownInput
              label="Gender"
              placeholder="Select Gender"
              options={GENDERS}
              error={errors.gender?.message as string}
              {...register("gender", { required: "Required" })}
            />
          </div>
        </section>

        {/* SECURITY & PHOTO */}
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
          <TextInput
            label="NEW PASSWORD"
            type="password"
            {...register("password")}
          />
        </section>

        {/* CONTACT DETAILS */}
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
              {...register("phone", { required: "Required" })}
            />
            <TextInput
              label="Email Address"
              {...register("email", { required: "Required" })}
            />
            <TextInput label="Country" {...register("country")} />
            <TextInput label="City" {...register("city")} />
            <TextInput
              label="Street Address"
              as="textarea"
              rows={4}
              {...register("street_address", { required: "Required" })}
            />
          </div>
        </section>
      </form>
    </>
  );
}
