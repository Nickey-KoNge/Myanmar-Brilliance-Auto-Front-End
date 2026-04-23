"use client";
import { Input } from "@/app/components/ui/Input/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCodeBranch,
  faUser,
  faMapLocation,
  faCircleCheck,
  faTable,
  faIdCard,
  faLocationDot,
  faPhone,
  faMapPin,
  faAddressBook,
  faCity,
  faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import styles from "./page.module.css";
import dynamic from "next/dynamic";
import DropdownInput from "@/app/components/ui/Inputs/DropdownInput";
import { FormCard } from "@/app/components/ui/FormCard/FormCard";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";

interface DropDownConfig {
  label: string;
  name: string;
  options: { id: string; name: string }[];
}

const MapPicker = dynamic(
  () => import("../../../../components/ui/MapPicker/MapPicker"),
  { ssr: false },
);

type FormData = Record<string, unknown>;

interface BranchFormProps {
  mode: "create" | "update";
  initialData?: FormData;
  onSubmit: SubmitHandler<FormData>;
  loading?: boolean;
  dropdown?: DropDownConfig;
  nameField: string;
  nameLabel: string;
  cancelHref: string;
}

export const BranchForm: React.FC<BranchFormProps> = ({
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
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: initialData || {},
  });

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faCodeBranch} />,
          text: mode === "create" ? "Create Record" : "Update Record",
          description:
            mode === "create" ? "Create New Record" : "Update Existing Record",
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
              form="branchForm"
              loading={loading}
            >
              {mode === "create" ? "save record" : "update record"}
            </ActionBtn>
          </div>
        }
      />

      <form
        id="branchForm"
        onSubmit={handleSubmit(onSubmit)}
        className={styles.page}
      >
        <div className={styles.grid}>
          {/* Dropdown */}
          {dropdown && (
            <FormCard title="Assignment" icon={faTable}>
              <div className={styles.fieldGroup}>
                <DropdownInput
                  label={dropdown.label}
                  placeholder={`Select ${dropdown.label}`}
                  options={dropdown.options}
                  {...register(dropdown.name)}
                />
              </div>
            </FormCard>
          )}

          {/* Name + GPS */}
          <FormCard title="Core Info" icon={faIdCard}>
            <div className={styles.row}>
              <Input
                label={nameLabel}
                type="text"
                placeholder={`Enter ${nameLabel}`}
                icon={<FontAwesomeIcon icon={faUser} />}
                error={errors[nameField]?.message as string}
                {...register(nameField, {
                  required: `${nameLabel} is required`,
                })}
              />

              <Input
                readOnly
                label="GPS LOCATION"
                type="text"
                placeholder="Enter GPS Location..."
                icon={<FontAwesomeIcon icon={faMapLocation} />}
                error={errors.gps_location?.message as string}
                {...register("gps_location", {
                  required: "GPS location is required",
                })}
              />
            </div>

            <Input
              label="DESCRIPTION"
              placeholder="Enter Description..."
              error={errors.description?.message as string}
              {...register("description", {
                required: "Description is required",
              })}
            />
          </FormCard>

          {/* Map */}
          <FormCard title="Location Map" icon={faLocationDot}>
            <div className={styles.mapPlaceholder}>
              <MapPicker setValue={setValue} />
            </div>
          </FormCard>

          {/* Contact */}
          <FormCard title="Contact & Address" icon={faAddressBook}>
            <div className={styles.row}>
              <Input
                label="PHONE NUMBER"
                type="text"
                placeholder="+95..."
                icon={<FontAwesomeIcon icon={faPhone} />}
                error={errors.phone?.message as string}
                {...register("phone", {
                  required: "Phone number is required",
                })}
              />

              <Input
                label="DIVISION"
                type="text"
                placeholder="Division"
                icon={<FontAwesomeIcon icon={faMapPin} />}
                error={errors.division?.message as string}
                {...register("division", {
                  required: "Division is required",
                })}
              />
            </div>

            <Input
              label="CITY"
              type="text"
              placeholder="City"
              icon={<FontAwesomeIcon icon={faCity} />}
              error={errors.city?.message as string}
              {...register("city", { required: "City is required" })}
            />

            <div className={styles.fieldGroup}>
              <label className={styles.textareaLabel}>Street Address</label>
              <textarea
                className={styles.textarea}
                placeholder="Enter Address..."
                {...register("address", {
                  required: "Address is required",
                })}
              />
            </div>
          </FormCard>
        </div>
      </form>
    </>
  );
};
