"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCar,
  faCircleCheck,
  faArrowsRotate,
  faCogs,
  faGasPump,
  faCarSide,
  faChair,
  faTags,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import DropdownInput from "@/app/components/ui/SearchBoxes/DropdownInput";
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";

import styles from "./VehicleModelForm.module.css"; // DriverForm style အတိုင်းသုံးနိုင်သည်
import { apiClient } from "@/app/features/lib/api-client";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";

export interface VehicleModelFormData {
  vehicle_model_name: string;
  vehicle_brand_id: string;
  body_type: string;
  fuel_type: string;
  transmission: string;
  engine_capacity: string;
  year_of_release: string;
  status: string;
}

interface VehicleModelFormProps {
  mode: "create" | "update";
  initialData?: Partial<VehicleModelFormData>;
  onSubmit: SubmitHandler<VehicleModelFormData>;
  loading?: boolean;
}

interface BrandOption {
  id: string;
  name: string;
}

export const VehicleModelForm: React.FC<VehicleModelFormProps> = ({
  mode,
  initialData,
  onSubmit,
  loading = false,
}) => {
  const [brands, setBrands] = useState<BrandOption[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleModelFormData>({
    mode: "onTouched",
    defaultValues: initialData || {
      status: "Active",
    },
  });

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await apiClient.get("/vehicle-model/list");
        const res = response?.data || response;
        if (res && res.brands) setBrands(res.brands);
      } catch (err) {
        console.error("Error fetching brands:", err);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faCar} />,
          text:
            mode === "create"
              ? "Vehicle Model Registration"
              : "Vehicle Model Update",
          description:
            mode === "create"
              ? "CREATE NEW VEHICLE MODEL"
              : "EDIT VEHICLE MODEL RECORD",
        }}
        actionNode={
          <div className={styles.headerActionArea}>
            <NavigationBtn href="/vehicle-model" variant="cancel">
              cancel
            </NavigationBtn>
            <ActionBtn
              type="submit"
              variant="action"
              leftIcon={mode === "create" ? faCircleCheck : faArrowsRotate}
              form="vehicleModelForm"
              loading={loading}
            >
              {mode === "create" ? "SAVE MODEL" : "UPDATE MODEL"}
            </ActionBtn>
          </div>
        }
      />

      <form
        id="vehicleModelForm"
        onSubmit={handleSubmit(onSubmit)}
        className={styles.formGridContainer}
      >
        <section className={styles.formGridBox}>
          <header className={styles.gridBoxTitle}>
            <span className={styles.pill} />
            <FontAwesomeIcon icon={faTags} className={styles.textDanger} />
            BASIC MODEL IDENTITY
          </header>
          <hr className={styles.cuttingLine} />
          <div className={styles.filterContainer}>
            <TextInput
              label="Model Name"
              placeholder="e.g. Toyota Crown"
              rightIcon={faCar}
              {...register("vehicle_model_name", {
                required: "Model Name is required",
              })}
              error={errors.vehicle_model_name?.message}
            />
            <DropdownInput
              label="Vehicle Brand"
              placeholder="Select Brand"
              options={brands}
              {...register("vehicle_brand_id", {
                required: "Brand is required",
              })}
              error={errors.vehicle_brand_id?.message}
            />
            <DateInput
              label="Year of Release"
              {...register("year_of_release", {
                required: "Release year is required",
              })}
              error={errors.year_of_release?.message}
            />
            <DropdownInput
              label="Status"
              placeholder="Select Status"
              options={[
                { id: "Active", name: "Active" },
                { id: "Inactive", name: "Inactive" },
              ]}
              {...register("status")}
            />
          </div>
        </section>

        {/* Section: Technical Specifications */}
        <section className={styles.formGridBox}>
          <header className={styles.gridBoxTitle}>
            <span className={styles.pill} />
            <FontAwesomeIcon icon={faCogs} className={styles.textDanger} />
            TECHNICAL SPECIFICATIONS
          </header>
          <hr className={styles.cuttingLine} />

          <div className={styles.filterContainer}>
            <TextInput
              label="Engine Capacity"
              placeholder="e.g. 2500cc"
              rightIcon={faInfoCircle}
              {...register("engine_capacity")}
            />
            <DropdownInput
              label="Fuel Type"
              placeholder="Select Fuel"
              options={[
                { id: "Petrol", name: "Petrol" },
                { id: "Diesel", name: "Diesel" },
                { id: "Hybrid", name: "Hybrid" },
                { id: "Electric", name: "Electric" },
              ]}
              {...register("fuel_type")}
            />
            <DropdownInput
              label="Transmission"
              placeholder="Select Transmission"
              options={[
                { id: "Automatic", name: "Automatic" },
                { id: "Manual", name: "Manual" },
                { id: "CVT", name: "CVT" },
              ]}
              {...register("transmission")}
            />

            <DropdownInput
              label="Body Type"
              placeholder="Select Body Type"
              options={[
                { id: "Sedan", name: "Sedan" },
                { id: "SUV", name: "SUV" },
                { id: "Hatchback", name: "Hatchback" },
                { id: "Pickup", name: "Pickup" },
              ]}
              {...register("body_type")}
            />
          </div>
        </section>
      </form>
    </>
  );
};
