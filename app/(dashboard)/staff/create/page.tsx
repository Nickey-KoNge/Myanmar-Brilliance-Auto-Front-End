"use client";
import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import Link from "next/link";
import styles from "./page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBorderAll,
  faCalendar,
  faCamera,
  faCaretDown,
  faCircleCheck,
  faIdCard,
  faLock,
  faPersonCircleExclamation,
  faShieldHalved,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const FILTERS = [
  {
    label: "Role",
    options: [
      "Driver",
      "Cleaner",
      "Manager",
      "Accountant",
      "Supervisor",
      "Receptionist",
    ],
  },
  {
    label: "Branch",
    options: ["Yangon", "Mandalay", "Naypyidaw", "Bago", "Taunggyi", "Pathein"],
  },
  {
    label: "Company",
    options: [
      "Acme Corp",
      "Globex Inc",
      "Initech",
      "Umbrella Corp",
      "Wayne Enterprises",
    ],
  },
];

const Genders = ["Male", "Female"];

export default function CreateStaff() {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
    }
  };
  const renderLiveButtonArea = (
    <div className={styles.headerActionArea}>
      <Link href="/staff" className={`${styles.btn} ${styles.btnCancel}`}>
        CANCEL
      </Link>
      <Link
        href="/staff/create"
        className={`${styles.btn} ${styles.btnSuccess}`}
      >
        <FontAwesomeIcon icon={faCircleCheck} />
        SAVE RECORD
      </Link>
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
        actionNode={renderLiveButtonArea}
      />

      <form className={styles.formGridContainer}>
        <div className={styles.formGridBox}>
          <div className={styles.gridBoxTitle}>
            <div className={styles.pill}></div>
            <FontAwesomeIcon icon={faBorderAll} className={styles.textDanger} />
            PROFESSIONAL ASSIGNMENT
          </div>

          <hr className={styles.cuttingLine} />

          <div className={styles.filterContainer}>
            {FILTERS.map((filter) => (
              <div className={styles.filterItem} key={filter.label}>
                <label
                  htmlFor={filter.label.toLowerCase()}
                  className={styles.inputLabel}
                >
                  {filter.label}
                </label>

                <div className={styles.inputWrapper}>
                  <select id={filter.label.toLowerCase()} defaultValue="all">
                    <option value="all">All {filter.label}</option>
                    {filter.options.map((opt) => (
                      <option key={opt} value={opt.toLowerCase()}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    className={styles.inputIcon}
                  />
                </div>
              </div>
            ))}

            <div className={styles.filterItem}>
              <label htmlFor="position" className={styles.inputLabel}>
                Position
              </label>

              <div className={styles.inputWrapper}>
                <input id="position" placeholder="Position" />
                <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formGridBox}>
          <div className={styles.gridBoxTitle}>
            <div className={styles.pill}></div>
            <FontAwesomeIcon
              icon={faPersonCircleExclamation}
              className={styles.textDanger}
            />
            CORE IDENTITY ATTRIBUTES
          </div>

          <hr className={styles.cuttingLine} />

          <div className={styles.filterContainer}>
            <div className={styles.filterItem}>
              <label htmlFor="staffName" className={styles.inputLabel}>
                Staff Name
              </label>

              <div className={styles.inputWrapper}>
                <input id="staffName" placeholder="Enter Your Name" />
                <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
              </div>
            </div>

            <div className={styles.filterItem}>
              <label htmlFor="nrc" className={styles.inputLabel}>
                NRC
              </label>

              <div className={styles.inputWrapper}>
                <input id="nrc" placeholder="Enter Your NRC Number" />
                <FontAwesomeIcon icon={faIdCard} className={styles.inputIcon} />
              </div>
            </div>

            <div className={styles.filterItem}>
              <label htmlFor="dob" className={styles.inputLabel}>
                Date of Birth
              </label>

              <div className={styles.inputWrapper}>
                <input type="date" name="" id="dob" />
                <FontAwesomeIcon
                  icon={faCalendar}
                  className={styles.inputIcon}
                />
              </div>
            </div>

            <div className={styles.filterItem}>
              <label htmlFor="gender" className={styles.inputLabel}>
                Gender
              </label>

              <div className={styles.inputWrapper}>
                <select id="gender" defaultValue="choose">
                  <option value="choose" disabled>
                    Choose Gender
                  </option>

                  {Genders.map((gender) => (
                    <option key={gender} value={gender.toLowerCase()}>
                      {gender}
                    </option>
                  ))}
                </select>

                <FontAwesomeIcon
                  icon={faCaretDown}
                  className={styles.inputIcon}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formGridBox}>
          <div className={styles.gridBoxTitle}>
            <div className={styles.pill}></div>
            <FontAwesomeIcon
              icon={faShieldHalved}
              className={styles.textDanger}
            />
            SECURITY & PHOTO
          </div>

          <hr className={styles.cuttingLine} />

          <div>
            <label htmlFor="photo" className={styles.inputLabel}>
              PROFILE IMAGE
            </label>
            <div className={styles.imageUploadWrapper}>
              {/* Hidden file input */}
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />

              {/* Upload area */}

              <div className={styles.imageUploadBox}>
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

                {/* Camera button overlay */}
                <div className={styles.cameraButton}>
                  <FontAwesomeIcon icon={faCamera} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.filterItem}>
            <label htmlFor="password" className={styles.inputLabel}>
              SECURE PASSWORD
            </label>

            <div className={styles.inputWrapper}>
              <input id="password" placeholder="Enter Your Password" />
              <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
            </div>
          </div>
        </div>
        <div className={styles.formGridBox}>d</div>
      </form>
    </>
  );
}
