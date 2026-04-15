"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faIdCard,
  faPhone,
  faCamera,
  faCircleCheck,
  faArrowsRotate,
  faAddressCard,
  faIdBadge,
  faShieldHalved,
  faGlobe,
  faCity,
  faMapMarkerAlt,
  faBriefcase,
  faEnvelope,
  faLock,
} from "@fortawesome/free-solid-svg-icons";

import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import DropdownInput from "@/app/components/ui/SearchBoxes/DropdownInput";
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";

import styles from "./DriverForm.module.css";
import { apiClient } from "@/app/features/lib/api-client";

// 🛑 email နှင့် password အား ဖြည့်စွက်ထားပါသည်
export interface DriverFormData {
  driver_name: string;
  nrc: string;
  phone: string;
  email: string;
  password?: string;
  license_no: string;
  license_type: string;
  license_expiry: string;
  driving_exp: string;
  dob: string;
  gender: string;
  city: string;
  country: string;
  address: string;
  station_id: string;
  deposits: string;
  join_date: string;
  photo?: FileList;
  image?: string;
}

interface DriverFormProps {
  mode: "create" | "update";
  initialData?: Partial<DriverFormData>;
  onSubmit: SubmitHandler<DriverFormData>;
  loading?: boolean;
}

interface StationOption {
  id: string;
  name: string;
}

interface DriverApiResponse {
  stations?: StationOption[];
}

export const DriverForm: React.FC<DriverFormProps> = ({
  mode,
  initialData,
  onSubmit,
  loading = false,
}) => {
 
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [stations, setStations] = useState<StationOption[]>([]);

  const preview =
    selectedImage ||
    (typeof initialData?.image === "string" ? initialData.image : null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DriverFormData>({
    mode: "onTouched",
    defaultValues: initialData || {},
  });

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await apiClient.get("master-company/driver");

        const res =
          (response as { data?: DriverApiResponse })?.data ||
          (response as DriverApiResponse);

        if (res && res.stations) {
          setStations(res.stations);
        }
      } catch (err) {
        console.error("Error fetching stations:", err);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faIdBadge} />,
          text: mode === "create" ? "Driver Registration" : "Driver Update",
          description:
            mode === "create"
              ? "CREATE NEW DRIVER RECORD"
              : "EDIT DRIVER RECORD",
        }}
        actionNode={
          <div className={styles.headerActionArea}>
            <NavigationBtn href="/driver" variant="cancel">
              cancel
            </NavigationBtn>
            <ActionBtn
              type="submit"
              variant="action"
              leftIcon={mode === "create" ? faCircleCheck : faArrowsRotate}
              form="driverForm"
              loading={loading}
            >
              {mode === "create" ? "SAVE RECORD" : "UPDATE RECORD"}
            </ActionBtn>
          </div>
        }
      />

      <form
        id="driverForm"
        onSubmit={handleSubmit(onSubmit)}
        className={styles.formGridContainer}
      >
        <section className={styles.formGridBox}>
          <header className={styles.gridBoxTitle}>
            <span className={styles.pill} />
            <FontAwesomeIcon
              icon={faAddressCard}
              className={styles.textDanger}
            />
            PROFESSIONAL ASSIGNMENT
          </header>
          <hr className={styles.cuttingLine} />
          <div className={styles.filterContainer}>
            <DropdownInput
              label="Station ID"
              placeholder="Select Station"
              options={stations}
              error={errors.station_id?.message}
              {...register("station_id", { required: "Station is required" })}
            />
            <TextInput
              label="Deposit Amount"
              placeholder="Deposit Amount..."
              rightIcon={faBriefcase}
              {...register("deposits")}
            />
            <TextInput
              label="License No"
              placeholder="License No..."
              {...register("license_no", { required: "Required" })}
            />
            <TextInput
              label="License Type"
              placeholder="License Type..."
              {...register("license_type")}
            />
            <DateInput label="License Expiry" {...register("license_expiry")} />
            <TextInput
              label="Driving Exp"
              placeholder="20 Years..."
              {...register("driving_exp")}
            />
          </div>
        </section>

        <section className={styles.formGridBox}>
          <header className={styles.gridBoxTitle}>
            <span className={styles.pill} />
            <FontAwesomeIcon icon={faUser} className={styles.textDanger} />
            CORE IDENTITY ATTRIBUTES
          </header>
          <hr className={styles.cuttingLine} />
          <div className={styles.filterContainer}>
            <TextInput
              label="Driver Name"
              placeholder="Enter Your Name..."
              rightIcon={faUser}
              {...register("driver_name", {
                required: "Driver Name is required",
              })}
            />
            <TextInput
              label="NRC Number"
              placeholder="Enter Your NRC..."
              rightIcon={faIdCard}
              {...register("nrc", { required: "NRC is required" })}
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
            <DateInput label="Date of Birth" {...register("dob")} />
            <DropdownInput
              label="Gender"
              placeholder="Chose Gender..."
              options={[
                { id: "Male", name: "Male" },
                { id: "Female", name: "Female" },
              ]}
              {...register("gender")}
            />
          </div>
        </section>

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

        <section className={styles.formGridBox}>
          <header className={styles.gridBoxTitle}>
            <span className={styles.pill} />
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className={styles.textDanger}
            />
            CONTACT & ADDRESS DETAILS
          </header>
          <hr className={styles.cuttingLine} />
          <div className={styles.filterContainer}>
            <TextInput
              label="Phone Number"
              placeholder="+95 9 xxx xxx xxx"
              rightIcon={faPhone}
              {...register("phone", { required: "Phone is required" })}
            />
            <TextInput
              label="Country"
              placeholder="country"
              rightIcon={faGlobe}
              {...register("country")}
            />
            <TextInput
              label="City"
              placeholder="city"
              rightIcon={faCity}
              {...register("city")}
            />
            <DateInput label="Join Date" {...register("join_date")} />
            <TextInput
              label="Street Address"
              placeholder="Enter Your Address..."
              as="textarea"
              rows={3}
              {...register("address", { required: "Address is required" })}
            />
          </div>
        </section>
      </form>
    </>
  );
};
