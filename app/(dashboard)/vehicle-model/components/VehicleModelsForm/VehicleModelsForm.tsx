"use client";

import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faCircleCheck,
  faArrowsRotate,
  faTags,
  faCogs,
  faCar,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import { FormCard } from "@/app/components/ui/FormCard/FormCard";
import { Input } from "@/app/components/ui/Input/Input";
import DropdownInput from "@/app/components/ui/SearchBoxes/DropdownInput";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";

import styles from "./VehicleModelForm.module.css";

export interface VehicleModelFormData {
  id?: string;
  vehicle_model_name: string;
  vehicle_brand_id: string;
  body_type: string;
  fuel_type: string;
  transmission: string;
  engine_capacity: string;
  year_of_release: string;
  status: string;
}

interface DropDownConfig {
  label: string;
  name: keyof VehicleModelFormData;
  options: { id: string; name: string }[];
}

interface VehicleModelFormProps {
  mode: "create" | "update";
  initialData?: Partial<VehicleModelFormData>;
  onSubmit: SubmitHandler<VehicleModelFormData>;
  loading?: boolean;
  dropdown?: DropDownConfig;
  nameField: "vehicle_model_name";
  nameLabel: string;
  cancelHref: string;
}

export const VehicleModelForm: React.FC<VehicleModelFormProps> = ({
  mode,
  initialData,
  onSubmit,
  loading = false,
  dropdown,
  nameField,
  nameLabel,
  cancelHref,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleModelFormData>({
    mode: "onTouched",
    defaultValues: initialData || { status: "Active" },
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset(initialData);
    }
  }, [initialData, reset]);

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faLayerGroup} />,
          text:
            mode === "create"
              ? "Vehicle Model Registration"
              : "Update Vehicle Model",
          description:
            mode === "create"
              ? "CREATE NEW VEHICLE MODEL RECORD"
              : "UPDATE EXISTING MODEL RECORD",
        }}
        actionNode={
          <div className={styles.headerActionArea}>
            <NavigationBtn href={cancelHref} variant="cancel">
              cancel
            </NavigationBtn>

            <ActionBtn
              type="submit"
              variant="action"
              leftIcon={mode === "create" ? faCircleCheck : faArrowsRotate}
              form="vehicleModelForm"
              loading={loading}
            >
              {mode === "create" ? "SAVE RECORD" : "UPDATE RECORD"}
            </ActionBtn>
          </div>
        }
      />

      <form
        id="vehicleModelForm"
        onSubmit={handleSubmit(onSubmit)}
        className={styles.page}
      >
        <div className={styles.grid}>
          {/* SECTION 1: CORE MODEL IDENTITY & ASSIGNMENT */}
          <FormCard title="CORE MODEL IDENTITY & ASSIGNMENT" icon={faTags}>
            <div className={styles.row}>
              <Input
                label={nameLabel}
                placeholder={`e.g. Toyota Crown`}
                icon={<FontAwesomeIcon icon={faCar} />}
                error={errors[nameField]?.message as string}
                {...register(nameField, {
                  required: `${nameLabel} is required`,
                })}
              />

              {dropdown && (
                <DropdownInput
                  label={dropdown.label}
                  placeholder={`Select ${dropdown.label}`}
                  options={dropdown.options}
                  error={errors[dropdown.name]?.message as string}
                  {...register(dropdown.name, {
                    required: `${dropdown.label} is required`,
                  })}
                />
              )}

              <DateInput
                label="Year of Release"
                error={errors.year_of_release?.message as string}
                {...register("year_of_release", {
                  required: "Release year is required",
                })}
              />
            </div>
          </FormCard>

          {/* SECTION 2: TECHNICAL SPECIFICATIONS */}
          <FormCard title="TECHNICAL SPECIFICATIONS" icon={faCogs}>
            <div className={styles.row}>
              <Input
                label="Engine Capacity"
                placeholder="e.g. 2500cc"
                icon={<FontAwesomeIcon icon={faInfoCircle} />}
                error={errors.engine_capacity?.message as string}
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
                error={errors.fuel_type?.message as string}
                {...register("fuel_type")}
              />

              <DropdownInput
                label="Transmission"
                placeholder="Select Transmission"
                options={[
                  { id: "Automatic", name: "Automatic" },
                  { id: "Manual", name: "Manual" },
                  { id: "CVT", name: "CVT" },
                  { id: "DCT", name: "Dual-Clutch (DCT)" },
                  { id: "Single-Speed", name: "Single-Speed (EV)" },
                ]}
                valueKey="id"
                nameKey="name"
                error={errors.transmission?.message as string}
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
                  { id: "MPV", name: "MPV / Minivan" },
                  { id: "Van", name: "Van" },
                  { id: "Wagon", name: "Station Wagon" },
                  { id: "Crossover", name: "Crossover (CUV)" },
                  { id: "Truck", name: "Truck / Light Truck" },
                ]}
                valueKey="id"
                nameKey="name"
                error={errors.body_type?.message as string}
                {...register("body_type")}
              />
            </div>
          </FormCard>
        </div>
      </form>
    </>
  );
};
