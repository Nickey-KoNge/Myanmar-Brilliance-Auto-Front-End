"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faCircleCheck,
  faUser,
  faGlobe,
  faPhone,
  faCity,
  faIdCard,
  faShieldHalved,
  faPortrait,
  faPersonCircleExclamation,
  faCamera,
  faArrowsRotate,
  faEnvelope,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";

import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import { FormCard } from "@/app/components/ui/FormCard/FormCard";
import { Input } from "@/app/components/ui/Input/Input";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";

import styles from "./page.module.css";
import DateInput from "@/app/components/ui/Inputs/DateInput";

export interface CompanyFormData {
  company_name: string;
  reg_number: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  street_address: string;
  website_url: string;
  establish_year: string;
  reg_exp_date: string;
  image: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
}

interface CompanyFormProps {
  mode: "create" | "update";
  initialData?: CompanyFormData;
  onSubmit: (data: FormData) => void;
  loading?: boolean;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  mode,
  initialData,
  onSubmit,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormData>({
    defaultValues: initialData || {},
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.image) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreview(initialData.image);
      }
    }
  }, [initialData, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const submitHandler: SubmitHandler<CompanyFormData> = (data) => {
    const submitData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        submitData.append(key, value as string);
      }
    });

    if (selectedFile) {
      submitData.append("image", selectedFile);
    }

    onSubmit(submitData);
  };

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faBuilding} />,
          text: mode === "create" ? "Company Registration" : "Update Company",
          description:
            mode === "create"
              ? "Create New Company Record"
              : "Update Existing Company",
        }}
        actionNode={
          <div className={styles.headerActionArea}>
            <NavigationBtn href="/company" variant="cancel">
              cancel
            </NavigationBtn>
            <ActionBtn
              type="submit"
              variant="action"
              leftIcon={mode === "create" ? faCircleCheck : faArrowsRotate}
              form="companyForm"
              loading={loading}
            >
              {mode === "create" ? "save record" : "update record"}
            </ActionBtn>
          </div>
        }
      />

      <form
        id="companyForm"
        onSubmit={handleSubmit(submitHandler)}
        className={styles.page}
      >
        <div className={styles.grid}>
          {/* LEFT 1 — Owner & Web Information (🛑 ၄ ပိုင်းဖြစ်အောင် ဒီထဲကို Owner အချက်အလက်တွေ ပေါင်းထည့်လိုက်ပါတယ်) */}
          <FormCard title="Owner & Web Information" icon={faBriefcase}>
            <div className={styles.row}>
              <Input
                label="OWNER NAME"
                type="text"
                placeholder="Enter Owner Name"
                icon={<FontAwesomeIcon icon={faUser} />}
                error={errors.owner_name?.message}
                {...register("owner_name", {
                  required: "Owner Name is required",
                })}
              />
              <Input
                label="OWNER PHONE"
                type="text"
                placeholder="+95 9 xxx xxx xxx"
                icon={<FontAwesomeIcon icon={faPhone} />}
                error={errors.owner_phone?.message}
                {...register("owner_phone")}
              />
            </div>

            <Input
              label="OWNER EMAIL"
              type="email"
              placeholder="owner@gmail.com"
              icon={<FontAwesomeIcon icon={faEnvelope} />}
              error={errors.owner_email?.message}
              {...register("owner_email")}
            />

            <hr
              className={styles.cuttingLine}
              style={{ opacity: 0.3, margin: "10px 0" }}
            />

            <div className={styles.row}>
              <Input
                label="COMPANY EMAIL"
                type="email"
                placeholder="company@gmail.com"
                icon={<FontAwesomeIcon icon={faEnvelope} />}
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="WEB SITE URL"
                type="text"
                placeholder="Enter Company Url"
                icon={<span>://</span>}
                error={errors.website_url?.message}
                {...register("website_url")}
              />
            </div>
          </FormCard>

          {/* RIGHT 1 — Core Identity Attributes */}
          <FormCard
            title="Core Identity Attributes"
            icon={faPersonCircleExclamation}
          >
            <div className={styles.row}>
              <Input
                label="COMPANY NAME"
                type="text"
                placeholder="Enter Company Name...."
                icon={<FontAwesomeIcon icon={faBuilding} />}
                error={errors.company_name?.message}
                {...register("company_name", {
                  required: "Company Name is required",
                })}
              />
              <Input
                label="COMPANY REGISTRATION NO"
                type="text"
                placeholder="Enter Your Reg Number...."
                icon={<FontAwesomeIcon icon={faIdCard} />}
                error={errors.reg_number?.message}
                {...register("reg_number")}
              />
            </div>

            <div className={styles.row}>
              <DateInput
                label="REGISTRATION EXPIRE"
                error={errors.reg_exp_date?.message}
                {...register("reg_exp_date", {
                  required: "reg_exp_date is required",
                })}
              />

              <DateInput
                label="ESTABLISH YEAR"
                error={errors.establish_year?.message}
                {...register("establish_year", {
                  required: "establish_year is required",
                })}
              />
            </div>
          </FormCard>

          {/* LEFT 2 — Security & Photo */}
          <FormCard title="Security & Photo" icon={faShieldHalved}>
            <div className={styles.imageUploadSection}>
              <div className={styles.imageUploadWrapper}>
                <input
                  type="file"
                  accept="image/*"
                  id="companyPhoto"
                  onChange={handleImageChange}
                  hidden
                />
                <label htmlFor="companyPhoto" className={styles.imageUploadBox}>
                  {preview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={preview}
                      alt="Preview"
                      className={styles.previewImage}
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className={styles.defaultIcon}
                    />
                  )}

                  <div className={styles.cameraButton}>
                    <FontAwesomeIcon icon={faCamera} />
                  </div>
                </label>
              </div>
            </div>
          </FormCard>

          {/* RIGHT 2 — Contact & Address Details */}
          <FormCard title="Contact & Address Details" icon={faPortrait}>
            <div className={styles.row}>
              <Input
                label="COMPANY PHONE"
                type="text"
                placeholder="+95 9 xxx xxx xxx"
                icon={<FontAwesomeIcon icon={faPhone} />}
                error={errors.phone?.message}
                {...register("phone")}
              />
              <Input
                label="COUNTRY"
                type="text"
                placeholder="Country"
                icon={<FontAwesomeIcon icon={faGlobe} />}
                error={errors.country?.message}
                {...register("country")}
              />
            </div>

            <Input
              label="CITY"
              type="text"
              placeholder="City"
              icon={<FontAwesomeIcon icon={faCity} />}
              error={errors.city?.message}
              {...register("city")}
            />

            <div className={styles.fieldGroup}>
              <label className={styles.textareaLabel}>Street Address</label>
              <textarea
                className={styles.textarea}
                placeholder="Enter Your Address...."
                {...register("street_address")}
              />
            </div>
          </FormCard>
        </div>
      </form>
    </>
  );
};
