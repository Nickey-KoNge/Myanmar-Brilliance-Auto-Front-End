"use client";

import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";

import { FormCard } from "@/app/components/ui/FormCard/FormCard";
import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import DropdownInput from "@/app/components/ui/SearchBoxes/DropdownInput";
import {
  faArrowsRotate,
  faCamera,
  faCar,
  faChargingStation,
  faCircleCheck,
  faDriversLicense,
  faIdCard,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import styles from "./VehicleForm.module.css";
import { Input } from "@/app/components/ui/Input/Input";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";
import { apiClient } from "@/app/features/lib/api-client";

export interface VehicleFormData {
  vehicle_name: string;
  station_id: string;
  group_id: string;
  vehicle_model_id: string;
  supplier_id?: string | null;
  city_taxi_no: string;
  serial_no: string;
  vin_no: string;
  engine_no: string;
  license_plate: string;
  color: string;
  license_type: string;
  current_odometer: string;
  vehicle_license_exp: string;
  service_intervals: string;
  purchase_date: string;
  image?: FileList | string;
}

interface StationOption {
  id: string;
  station_name: string;
}

interface GroupOption {
  id: string;
  group_name: string;
}

interface VehicleModelOption {
  id: string;
  vehicle_model_name: string;
}

interface VehicleFormProps {
  mode: "create" | "update";
  initialData?: Partial<VehicleFormData>;
  onSubmit: SubmitHandler<VehicleFormData>;
  loading?: boolean;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  mode,
  initialData,
  onSubmit,
  loading = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [stations, setStations] = useState<StationOption[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModelOption[]>([]);

  const preview =
    selectedImage ||
    (typeof initialData?.image === "string" ? initialData.image : null);

  const {
    register,
    handleSubmit,
    reset,

    formState: { errors },
  } = useForm<VehicleFormData>({
    mode: "onTouched",
    defaultValues: initialData || {},
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset(initialData);
    }
  }, [initialData, reset]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [stationsRes, groupsRes, vehicleModelsRes] = await Promise.all([
          apiClient.get("/master-company/stations?limit=1000"),
          apiClient.get("/master-company/groups?limit=1000"),
          apiClient.get("/master-vehicle/vehicle-models?limit=1000"),
        ]);

        const extractData = <T,>(res: unknown): T[] => {
          if (!res) return [];
          if (Array.isArray(res)) return res as T[];

          const resObj = res as Record<string, unknown>;
          if (Array.isArray(resObj.items)) return resObj.items as T[];
          if (Array.isArray(resObj.data)) return resObj.data as T[];

          if (resObj.data && typeof resObj.data === "object") {
            const nested = resObj.data as Record<string, unknown>;
            if (Array.isArray(nested.items)) return nested.items as T[];
            if (Array.isArray(nested.data)) return nested.data as T[];
          }
          return [];
        };

        const formatStations = (
          dataList: Record<string, unknown>[],
        ): StationOption[] => {
          return dataList.map((item, index) => ({
            id: String(item.id || `station-${index}`),
            station_name: String(
              item.station_name || item.name || "Unknown Station",
            ),
          }));
        };

        const formatGroups = (
          dataList: Record<string, unknown>[],
        ): GroupOption[] => {
          return dataList.map((item, index) => ({
            id: String(item.id || `group-${index}`),
            group_name: String(item.group_name || item.name || "Unknown Group"),
          }));
        };

        const formatVehicleModels = (
          dataList: Record<string, unknown>[],
        ): VehicleModelOption[] => {
          return dataList.map((item, index) => ({
            id: String(item.id || `model-${index}`),
            vehicle_model_name: String(
              item.vehicle_model_name || item.name || "Unknown Model",
            ),
          }));
        };

        setStations(
          formatStations(extractData<Record<string, unknown>>(stationsRes)),
        );
        setGroups(
          formatGroups(extractData<Record<string, unknown>>(groupsRes)),
        );
        setVehicleModels(
          formatVehicleModels(
            extractData<Record<string, unknown>>(vehicleModelsRes),
          ),
        );
      } catch (err) {
        console.error("Error fetching form options:", err);
      }
    };
    fetchOptions();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };

  return (
    <>
      <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faCar} />,
          text: mode === "create" ? "Vehicle Registration" : "Update Vehicle",
          description:
            mode === "create" ? "CREATE NEW VEHICLE" : "UPDATE VEHICLE",
        }}
        actionNode={
          <div className={styles.headerActionArea}>
            <NavigationBtn href="/vehicle" variant="cancel">
              cancel
            </NavigationBtn>
            <ActionBtn
              type="submit"
              variant="action"
              leftIcon={mode === "create" ? faCircleCheck : faArrowsRotate}
              form="vehicleForm"
              loading={loading}
            >
              {mode === "create" ? "save record" : "update record"}
            </ActionBtn>
          </div>
        }
      />

      <form
        id="vehicleForm"
        onSubmit={handleSubmit(onSubmit)}
        className={styles.page}
      >
        <div className={styles.grid}>
          <FormCard title="Station" icon={faChargingStation}>
            <DropdownInput
              label="Station"
              placeholder="Select Station"
              options={stations.map((station, idx) => ({
                id: station.id || `station-opt-${idx}`,
                name: station.station_name,
              }))}
              valueKey="id"
              nameKey="name"
              {...register("station_id", {
                required: mode === "create" ? "Station is required" : false,
              })}
              error={errors.station_id?.message as string}
            />

            <DropdownInput
              label="Group"
              placeholder="Select Group"
              options={groups.map((group, idx) => ({
                id: group.id || `group-opt-${idx}`,
                name: group.group_name,
              }))}
              valueKey="id"
              nameKey="name"
              {...register("group_id", {
                required: mode === "create" ? "Group is required" : false,
              })}
              error={errors.group_id?.message as string}
            />

            <DropdownInput
              label="Vehicle Model"
              placeholder="Select Vehicle Model"
              options={vehicleModels.map((model, idx) => ({
                id: model.id || `model-opt-${idx}`,
                name: model.vehicle_model_name,
              }))}
              valueKey="id"
              nameKey="name"
              {...register("vehicle_model_id", {
                required:
                  mode === "create" ? "Vehicle model is required" : false,
              })}
              error={errors.vehicle_model_id?.message as string}
            />
          </FormCard>

          <FormCard title="CORE IDENTITY ATTRIBUTES" icon={faIdCard}>
            <div className={styles.row}>
              <Input
                label="Vehicle License"
                type="text"
                placeholder="Enter Vehicle License Plate"
                icon={<FontAwesomeIcon icon={faDriversLicense} />}
                error={errors.license_plate?.message as string}
                {...register("license_plate", {
                  required: "Vehicle License Plate is required",
                })}
              />

              <Input
                label="Vehicle License Type"
                type="text"
                placeholder="Enter Vehicle License Type"
                icon={<FontAwesomeIcon icon={faDriversLicense} />}
                error={errors.license_type?.message as string}
                {...register("license_type", {
                  required: "Vehicle License Type is required",
                })}
              />

              <DateInput
                label="Vehicle License Expiry"
                placeholder="Select Expiry Date"
                error={errors.vehicle_license_exp?.message as string}
                {...register("vehicle_license_exp", {
                  required: "Vehicle License Expiry Date is required",
                })}
              />

              <DateInput
                label="Purchase Date"
                placeholder="Select Purchase Date"
                error={errors.purchase_date?.message as string}
                {...register("purchase_date", {
                  required: "Purchase Date is required",
                })}
              />

              <DateInput
                label="Service Intervals"
                placeholder="Select Service Interval"
                error={errors.service_intervals?.message as string}
                {...register("service_intervals", {
                  required: "Service Intervals is required",
                })}
              />

              <Input
                label="City Taxi No"
                type="text"
                placeholder="Enter City Taxi No"
                icon={<FontAwesomeIcon icon={faIdCard} />}
                error={errors.city_taxi_no?.message as string}
                {...register("city_taxi_no", {
                  required: "City Taxi No is required",
                })}
              />
            </div>
          </FormCard>

          {/* Image */}
          <FormCard title="Vehicle Image" icon={faCar}>
            <div className={styles.imageUploadWrapper}>
              <input
                type="file"
                accept="image/*"
                id="image"
                {...register("image", {
                  required: mode === "create" ? "A photo is required" : false,
                  onChange: handleImageChange,
                })}
                hidden
              />
              <label htmlFor="image" className={styles.imageUploadBox}>
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
              {errors.image && (
                <p className={styles.error}>{errors.image.message as string}</p>
              )}
            </div>
          </FormCard>

          {/* Vehicle Details */}
          <FormCard title="Vehicle Details" icon={faCar}>
            <div className={styles.row}>
              <Input
                label="Vehicle Name"
                type="text"
                placeholder="Enter Vehicle Name"
                icon={<FontAwesomeIcon icon={faCar} />}
                error={errors.vehicle_name?.message as string}
                {...register("vehicle_name", {
                  required: "Vehicle Name is required",
                })}
              />

              <Input
                label="Serial No"
                type="text"
                placeholder="Enter Serial No"
                icon={<FontAwesomeIcon icon={faCar} />}
                error={errors.serial_no?.message as string}
                {...register("serial_no", {
                  required: "Serial No is required",
                })}
              />

              <Input
                label="Color"
                type="text"
                placeholder="Enter Vehicle Color"
                icon={<FontAwesomeIcon icon={faCar} />}
                error={errors.color?.message as string}
                {...register("color", {
                  required: "Vehicle Color is required",
                })}
              />

              <Input
                label="Current Odometer"
                type="text"
                placeholder="Enter Current Odometer Reading"
                icon={<FontAwesomeIcon icon={faCar} />}
                error={errors.current_odometer?.message as string}
                {...register("current_odometer", {
                  required: "Current Odometer Reading is required",
                })}
              />

              <Input
                label="VIN No"
                type="text"
                placeholder="Enter VIN No"
                icon={<FontAwesomeIcon icon={faCar} />}
                error={errors.vin_no?.message as string}
                {...register("vin_no", {
                  required: "VIN No is required",
                })}
              />

              <Input
                label="Engine No"
                type="text"
                placeholder="Enter Engine No"
                icon={<FontAwesomeIcon icon={faCar} />}
                error={errors.engine_no?.message as string}
                {...register("engine_no", {
                  required: "Engine No is required",
                })}
              />
            </div>
          </FormCard>
        </div>
      </form>
    </>
  );
};
