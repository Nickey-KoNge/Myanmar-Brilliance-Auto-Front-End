"use client";

import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faCircleCheck,
  faArrowsRotate,
  faUserTag,
  faTags,
  faAddressCard,
  faTable,
} from "@fortawesome/free-solid-svg-icons";

import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import { FormCard } from "@/app/components/ui/FormCard/FormCard";
import { Input } from "@/app/components/ui/Input/Input";
import DropdownInput from "@/app/components/ui/SearchBoxes/DropdownInput";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";

import styles from "./page.module.css";

interface DropDownConfig {
  label: string;
  name: keyof GroupsFormData;
  options: { id: string; name: string }[];
}

export interface GroupsFormData {
  id?: string;
  station_id?: string;
  group_name: string;
  group_type: string;
  description: string;
  stations?: unknown;
}

interface GroupsFormProps {
  mode: "create" | "update";
  initialData?: Partial<GroupsFormData>;
  onSubmit: SubmitHandler<GroupsFormData>;
  loading?: boolean;
  dropdown?: DropDownConfig;
  nameField: "group_name";
  nameLabel: string;
  cancelHref: string;
}

export const GroupsForm: React.FC<GroupsFormProps> = ({
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
  } = useForm<GroupsFormData>({
    defaultValues: initialData || {},
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
          text: mode === "create" ? "Groups Registration" : "Update Groups",
          description:
            mode === "create"
              ? "CREATE NEW GROUPS RECORD"
              : "UPDATE EXISTING GROUPS RECORD",
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

          {/* RIGHT SECTION */}
          <FormCard title="CORE IDENTITY ATTRIBUTES" icon={faUserTag}>
            <div className={styles.row}>
              <Input
                label={nameLabel}
                placeholder={`Enter ${nameLabel}`}
                icon={<FontAwesomeIcon icon={faTags} />}
                error={errors[nameField]?.message}
                {...register("group_name", {
                  required: `${nameLabel} is required`,
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

            <Input
              label="DESCRIPTION"
              placeholder="Enter Description..."
              error={errors.description?.message}
              {...register("description", {
                required: "Description is required",
              })}
            />
          </FormCard>
        </div>
      </form>
    </>
  );
};
