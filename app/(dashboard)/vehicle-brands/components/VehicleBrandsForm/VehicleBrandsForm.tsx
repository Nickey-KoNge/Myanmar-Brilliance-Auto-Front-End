"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faCircleCheck,
  faShieldHalved,
  faPortrait,
  faUser,
  faGlobe,
  faCity,
  faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";

import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";

import styles from "./page.module.css";

export interface VehicleBrandsFormData {
  vehicle_brand_name: string;
  country_of_origin: string;
  manufacturer: string;
  description: string;
  image?: string;
  photo?: FileList;
}

interface VehicleBrandsFormProps {
  mode: "create" | "update";
  initialData?: Partial<VehicleBrandsFormData>;
  onSubmit: SubmitHandler<VehicleBrandsFormData>;
  loading?: boolean;
}

export const VehicleBrandsForm: React.FC<VehicleBrandsFormProps> = ({
  mode,
  initialData,
  onSubmit,
  loading = false,
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleBrandsFormData>({
    mode: "onTouched",
    defaultValues: initialData || {},
  });

  useEffect(() => {
    if (
      initialData &&
      initialData.vehicle_brand_name &&
      initialData.vehicle_brand_name.length > 0
    ) {
      reset({
        ...initialData,
        vehicle_brand_name: String(initialData.vehicle_brand_name),
      });
    }
  }, [initialData, reset]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faUser} />,
          text:
            mode === "create"
              ? "Vehicle Brand Registration"
              : "Vehicle Brand Update",
          description:
            mode === "create"
              ? "CREATE NEW VEHICLE BRAND"
              : "EDIT VEHICLE BRAND",
        }}
        actionNode={
          <div className={styles.headerActionArea}>
            <NavigationBtn href="/vehicle-brands" variant="cancel">
              cancel
            </NavigationBtn>
            <ActionBtn
              type="submit"
              variant="action"
              leftIcon={mode === "create" ? faCircleCheck : faArrowsRotate}
              form="vehicleBrandsForm"
              loading={loading}
            >
              {mode === "create" ? "save record" : "update record"}
            </ActionBtn>
          </div>
        }
      />

      <form
        id="vehicleBrandsForm"
        onSubmit={handleSubmit(onSubmit)}
        className={styles.formGridContainer}
      >
        {/* Section: Image */}
        <section className={styles.formGridBox}>
          <header className={styles.gridBoxTitle}>
            <span className={styles.pill} />
            <FontAwesomeIcon
              icon={faShieldHalved}
              className={styles.textDanger}
            />
            PHOTO
          </header>
          <hr className={styles.cuttingLine} />

          <div className={styles.imageUploadSection}>
            <div className={styles.imageUploadWrapper}>
              <input
                type="file"
                accept="image/*"
                id="photo"
                aria-invalid={!!errors.image}
                {...register("photo", {
                  required: mode === "create" ? "A photo is required" : false,
                  onChange: handleImageChange,
                })}
                hidden
              />

              <label htmlFor="photo" className={styles.imageUploadBox}>
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
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

              {errors.image && (
                <p className={styles.error}>{errors.image.message as string}</p>
              )}
            </div>
          </div>
        </section>

        {/* Section: Details */}
        <section className={styles.formGridBox}>
          <header className={styles.gridBoxTitle}>
            <span className={styles.pill} />
            <FontAwesomeIcon icon={faPortrait} className={styles.textDanger} />
            VEHICLE BRAND DETAILS
          </header>
          <hr className={styles.cuttingLine} />

          {/* <div className={styles.filterContainer}> */}
          <TextInput
            label="Vehicle Brand Name"
            placeholder="TOYOTA"
            rightIcon={faGlobe}
            error={errors.vehicle_brand_name?.message}
            {...register("vehicle_brand_name", {
              required: "Vehicle brand name is required",
            })}
          />

          <TextInput
            label="Country of Origin"
            placeholder="JAPAN"
            rightIcon={faGlobe}
            error={errors.country_of_origin?.message}
            {...register("country_of_origin", {
              required: "Country of origin is required",
            })}
          />

          <TextInput
            label="Manufacturer"
            placeholder="TOYOTA INC"
            rightIcon={faCity}
            error={errors.manufacturer?.message}
            {...register("manufacturer", {
              required: "Manufacturer is required",
            })}
          />

          <TextInput
            label="Description"
            placeholder="Enter description..."
            as="textarea"
            rows={3}
            error={errors.description?.message}
            {...register("description", {
              required: "Description is required",
            })}
          />
          {/* </div> */}
        </section>
      </form>
    </>
  );
};
