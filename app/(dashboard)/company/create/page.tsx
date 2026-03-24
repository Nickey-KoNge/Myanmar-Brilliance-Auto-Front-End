"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./CreateCompany.module.css";
import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBorderAll,
  faBuilding,
  faCalendar,
  faCamera,
  faCircleCheck,
  faCity,
  faClockRotateLeft,
  faGlobe,
  faIdCard,
  faPersonCircleExclamation,
  faPhone,
  faPortrait,
  faShieldHalved,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

type CompanyFormData = {
  name: string;
  email: string;
  website: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  regNo: string;
  regExpire: string;
  establishYear: string;
};

export default function CreateCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    email: "",
    website: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    regNo: "",
    regExpire: "",
    establishYear: "",
  });

  const handleChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Append all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
      });

      // Append image if selected
      if (selectedFile) {
        submitData.append("image", selectedFile);
      }

      // Replace with your actual API endpoint or apiClient call
      const response = await fetch("http://localhost:3001/master-company/company", {
        method: "POST",
        body: submitData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to save company");
      }

      // Redirect to the company list page on success
      router.push("/company");
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const ActionButtons = (
    <div className={styles.headerActionArea}>
      <Link href="/company" className={`${styles.btn} ${styles.btnCancel}`}>
        CANCEL
      </Link>
      <button
        type="submit"
        form="companyForm"
        disabled={loading}
        className={`${styles.btn} ${styles.btnSuccess}`}
      >
        <FontAwesomeIcon icon={faCircleCheck} />
        {loading ? "SAVING..." : "SAVE RECORD"}
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faBuilding} />,
          text: "Company Registration",
          description: "CREATE NEW COMPANY RECORD",
        }}
        actionNode={ActionButtons}
      />

      <form
        id="companyForm"
        onSubmit={handleSubmit}
        className={styles.formGridContainer}
      >
        {/* TOP LEFT: PROFESSIONAL ASSIGNMENT */}
        <section className={styles.formGridBox}>
          <header className={styles.gridBoxTitle}>
            <span className={styles.pill} />
            <FontAwesomeIcon icon={faBorderAll} className={styles.textDanger} />
            PROFESSIONAL ASSIGNMENT
          </header>
          <hr className={styles.cuttingLine} />

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>WEB SITE URL</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Enter Your Company Url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
              />
              <span className={styles.inputIcon}>://</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>EMAIL</label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                placeholder="Example@gmail.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
            </div>
          </div>
        </section>

        {/* TOP RIGHT: CORE IDENTITY ATTRIBUTES */}
        <section className={styles.formGridBox}>
          <header className={styles.gridBoxTitle}>
            <span className={styles.pill} />
            <FontAwesomeIcon
              icon={faPersonCircleExclamation}
              className={styles.textDanger}
            />
            CORE IDENTITY ATTRIBUTES
          </header>
          <hr className={styles.cuttingLine} />

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>COMPANY NAME</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  required
                  placeholder="Enter Your Name...."
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>COMPANY REGISTRATION NO</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="Enter Your Reg Number...."
                  value={formData.regNo}
                  onChange={(e) => handleChange("regNo", e.target.value)}
                />
                <FontAwesomeIcon icon={faIdCard} className={styles.inputIcon} />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>REGISTRATION EXPIRE</label>
              <div className={styles.inputWrapper}>
                <input
                  type="date"
                  value={formData.regExpire}
                  onChange={(e) => handleChange("regExpire", e.target.value)}
                />
                <FontAwesomeIcon icon={faCalendar} className={styles.inputIcon} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>ESTABLISH YEAR</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="10 year"
                  value={formData.establishYear}
                  onChange={(e) => handleChange("establishYear", e.target.value)}
                />
                <FontAwesomeIcon
                  icon={faClockRotateLeft}
                  className={styles.inputIcon}
                />
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM LEFT: SECURITY & PHOTO */}
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

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>PROFILE IMAGE</label>
            <div className={styles.imageUploadWrapper}>
              <input
                type="file"
                accept="image/*"
                id="photo"
                onChange={handleImageChange}
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
        </section>

        {/* BOTTOM RIGHT: CONTACT & ADDRESS DETAILS */}
        <section className={styles.formGridBox}>
          <header className={styles.gridBoxTitle}>
            <span className={styles.pill} />
            <FontAwesomeIcon icon={faPortrait} className={styles.textDanger} />
            CONTACT & ADDRESS DETAILS
          </header>
          <hr className={styles.cuttingLine} />

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>PHONE NUMBER</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="+95 9 xxx xxx xxx"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                <FontAwesomeIcon icon={faPhone} className={styles.inputIcon} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>COUNTRY</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="country"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                />
                <FontAwesomeIcon icon={faGlobe} className={styles.inputIcon} />
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>CITY</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
              <FontAwesomeIcon icon={faCity} className={styles.inputIcon} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>STREET ADDRESS</label>
            <div className={styles.inputWrapper}>
              <textarea
                rows={4}
                placeholder="Enter Your Address...."
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}