"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faCircleCheck,
  faArrowsRotate,
  faThLarge,
  faUserTag,
  faTags,
  faAddressCard
} from "@fortawesome/free-solid-svg-icons";

import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import { FormCard } from "@/app/components/ui/FormCard/FormCard";
import { Input } from "@/app/components/ui/Input/Input";
import DropdownInput from "@/app/components/ui/SearchBoxes/DropdownInput";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";

import styles from "./page.module.css";

export interface GroupsFormData {
  id?: string;
  station_id: string;
  group_name: string;
  group_type: string;
  description: string;
}

interface GroupsFormProps {
  mode: "create" | "update";
  initialData?: GroupsFormData;
  onSubmit: (data: GroupsFormData) => void;
  loading?: boolean;
}

export const GroupsForm: React.FC<GroupsFormProps> = ({
  mode,
  initialData,
  onSubmit,
  loading = false,
}) => {

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<GroupsFormData>({
    defaultValues: {
      station_id: "",
      group_name: "",
      group_type: "",
      description: "",
    },
  });

  // Update mode → fill form
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const stationValue = watch("station_id") || "";

  

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faLayerGroup} />,
          text: mode === "create" ? "Groups Registration" : "Update Groups",
          description:
            mode === "create"
              ? "CREATE NEW GROUPS RECORD"
              : "UPDATE EXISTING GROUPS RECORD",
        }}
        actionNode={
          <div className={styles.headerActionArea}>
            <NavigationBtn href="/groups" variant="cancel">
              CANCEL
            </NavigationBtn>

            <ActionBtn
              type="submit"
              variant="action"
              leftIcon={mode === "create" ? faCircleCheck : faArrowsRotate}
              form="groupsForm"
              loading={loading}
            >
              {mode === "create" ? "SAVE RECORD" : "UPDATE RECORD"}
            </ActionBtn>
          </div>
        }
      />

      <form
        id="groupsForm"
        onSubmit={handleSubmit(onSubmit)}
        className={styles.page}
      >
        <div className={styles.grid}>

          {/* LEFT SECTION */}
          <FormCard title="PROFESSIONAL ASSIGNMENT" icon={faThLarge}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>STATIONS</label>

              <div className={styles.dropdownWrapper}>
                <DropdownInput
                  options={[
                    { id: "019d7144-4f46-7d43-bf2d-64a71e2bd80f", name: "All Stations" },
                    { id: "2", name: "Main Station" },
                  ]}
                  valueKey="id"
                  nameKey="name"
                  value={stationValue}
                  placeholder="Select Station"
                  onChange={(e) => {
                    setValue("station_id", e.target.value, {
                      shouldValidate: true,
                    });
                  }}
                />
              </div>

              {/* ✅ Error */}
              {errors.station_id && (
                <span className={styles.errorText}>
                  {errors.station_id.message}
                </span>
              )}
            </div>
          </FormCard>

          {/* RIGHT SECTION */}
          <FormCard title="CORE IDENTITY ATTRIBUTES" icon={faUserTag}>
            <div className={styles.row}>
              <Input
                label="GROUP NAME"
                placeholder="Enter Your Group Name...."
                icon={<FontAwesomeIcon icon={faTags} />}
                error={errors.group_name?.message}
                {...register("group_name", {
                  required: "Group Name is required",
                })}
              />

              <Input
                label="GROUP TYPE"
                placeholder="Enter Your Group Type ..."
                icon={<FontAwesomeIcon icon={faAddressCard} />}
                error={errors.group_type?.message}
                {...register("group_type", {
                  required: "Group Type is required",
                })}
              />
            </div>

            <div className={styles.fieldGroup} style={{ marginTop: "20px" }}>
              <label className={styles.label}>DESCRIPTION</label>
              <textarea
                className={styles.textarea}
                placeholder="Enter Your Description...."
                {...register("description")}
              />
            </div>
          </FormCard>

        </div>
      </form>
    </>
  );
};