"use client";

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

import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import TextInput from "@/app/components/ui/Inputs/TextInput";

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
        // className={styles.page}
        className={styles.formGridContainer}
      >
  
          <section className={styles.formGridBox}>
            <header className={styles.gridBoxTitle}>
              <span className={styles.pill}></span>
              <FontAwesomeIcon icon={faTable} className={styles.textDanger} />
              ASSIGNMENT

            </header>
            <hr className={styles.cuttingLine} />

            <div className={styles.filterContainer}>
              {dropdown && (
                <DropdownInput
                  label={dropdown.label}
                  placeholder={`Select ${dropdown.label}`}
                  options={dropdown.options}
                  {...register(dropdown.name)}
                />
              )}
            </div>

          </section>

  

          <section className={styles.formGridBox}>
            <header className={styles.gridBoxTitle}>
              <span className={styles.pill}></span>
              <FontAwesomeIcon icon={faIdCard} className={styles.textDanger} />
              CORE INFO

            </header>
            <hr className={styles.cuttingLine} />
            <div className={styles.filterContainer}>
              <TextInput
                label={nameLabel}
                type="text"
                placeholder={`Enter ${nameLabel}`}
                rightIcon={faUser}
                error={errors[nameField]?.message as string}
                {...register(nameField, {
                  required: `${nameLabel} is required`,
                })}
              />
              <TextInput
                readOnly
                label="GPS LOCATION"
                type="text"
                placeholder="Enter GPS Location..."
                rightIcon={faMapLocation}
                error={errors.gps_location?.message as string}
                {...register("gps_location", {
                  required: "GPS location is required",
                })}
              />

                <TextInput
              label="DESCRIPTION"
              placeholder="Enter Description..."
              error={errors.description?.message as string}
              {...register("description", {
                required: "Description is required",
              })}
            />

            </div>
          </section>



   

          <section className={styles.formGridBox}>
            <header className={styles.gridBoxTitle}>
              <span className={styles.pill}></span>
              <FontAwesomeIcon icon={faLocationDot} className={styles.textDanger} />
              LOCATION MAP
            </header>
            <hr className={styles.cuttingLine} />

   
                <div className={styles.mapPlaceholder}>
              <MapPicker setValue={setValue} />
            </div>
            
          
          </section>

 

          <section className={styles.formGridBox}>
            <header className={styles.gridBoxTitle}>
              <span className={styles.pill}></span>
              <FontAwesomeIcon icon={faAddressBook} className={styles.textDanger} />
              CONTACT & ADDRESS
            </header>
            <hr className={styles.cuttingLine} />
            <div className={styles.filterContainer}>
              <TextInput
                label="PHONE NUMBER"
                type="text"
                placeholder="+95..."
                rightIcon={faPhone}
                error={errors.phone?.message as string}
                {...register("phone", {
                  required: "Phone number is required",
                })}
              />
              <TextInput
                label="DIVISION"
                type="text"
                placeholder="Division"
                rightIcon={faMapPin}
                error={errors.division?.message as string}
                {...register("division", {
                  required: "Division is required",
                })}
              />
              <TextInput
                label="CITY"
                type="text"
                placeholder="City"
                rightIcon={faCity}
                error={errors.city?.message as string}
                {...register("city", { required: "City is required" })}
              />


              <TextInput
                label="Street Address"
                placeholder="Enter Address..."
                as="textarea"
                rows={3}
                {...register("address", {
                  required: "Address is required",
                })}
                error={errors.address?.message}
              />
           
            </div>
          </section>

            

        
      </form>
    </>
  );
};
