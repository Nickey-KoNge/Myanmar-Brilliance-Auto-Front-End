"use client";

import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import { FormCard } from "@/app/components/ui/FormCard/FormCard";
import DropdownInput from "@/app/components/ui/Inputs/DropdownInput";
import TextInput from "@/app/components/ui/Inputs/TextInput";
import { apiClient } from "@/app/features/lib/api-client";
import {
  faCircleCheck,
  faMap,
  faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState, useCallback } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import styles from "./page.module.css";

export interface TripFormData {
  route_id: string;
  route_name?: string;
  vehicle_model_id: string;
  vehicle_model_name?: string;
  station_id: string;
  station_name?: string;
  daily_trip_rate: string;
  overnight_trip_rate: string;
  status?: string;
}

interface TripFormProps {
  mode: "create" | "update";
  initialData?: Partial<TripFormData>;
  onSubmit: SubmitHandler<TripFormData>;
  loading?: boolean;
  onClose: () => void;
}

interface RouteOption {
  id: string;
  route_name?: string;
  name?: string;
}

interface VehicleModelOption {
  id: string;
  vehicle_model_name?: string;
  model_name?: string;
  name?: string;
}

interface StationOption {
  id: string;
  station_name?: string;
  name?: string;
}

export const TripForm: React.FC<TripFormProps> = ({
  mode,
  initialData,
  onSubmit,
  loading = false,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TripFormData>({
    mode: "onTouched",
    defaultValues: initialData || {},
  });

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModelOption[]>([]);
  const [stations, setStations] = useState<StationOption[]>([]);

  useEffect(() => {
    if (!initialData) return;

    const route = routes.find(
      (r) =>
        r.route_name === initialData.route_name ||
        r.name === initialData.route_name,
    );

    const model = vehicleModels.find(
      (m) =>
        m.vehicle_model_name === initialData.vehicle_model_name ||
        m.model_name === initialData.vehicle_model_name ||
        m.name === initialData.vehicle_model_name,
    );

    const station = stations.find(
      (s) =>
        s.station_name === initialData.station_name ||
        s.name === initialData.station_name,
    );

    if (route && model && station) {
      reset({
        ...initialData,
        route_id: route.id,
        vehicle_model_id: model.id,
        station_id: station.id,
      });
    }
  }, [initialData, routes, vehicleModels, stations, reset]);

  // fetch route, vehicle model, stations
  const fetchOptions = useCallback(async () => {
    try {
      const [routesResponse, vehicleModelsResponse, stationsResponse] =
        await Promise.all([
          apiClient.get("/master-trips/routes"),
          apiClient.get("/master-vehicle/vehicle-models"),
          apiClient.get("/master-company/stations"),
        ]);

      // Nested Data နှင့် .items ဖြစ်နေခဲ့လျှင်ပါ အတိအကျ Extract လုပ်ပေးမည့် Helper Function
      const extractData = <T,>(response: unknown): T[] => {
        const resObj = response as { data?: T[] | { data?: T[] }; items?: T[] };
        if (Array.isArray(resObj?.items)) return resObj.items;
        if (Array.isArray(resObj?.data)) return resObj.data as T[];
        if (
          resObj?.data &&
          typeof resObj.data === "object" &&
          "data" in resObj.data &&
          Array.isArray((resObj.data as { data: T[] }).data)
        ) {
          return (resObj.data as { data: T[] }).data;
        }
        if (Array.isArray(response)) return response as T[];
        return [];
      };

      setRoutes(extractData<RouteOption>(routesResponse));
      setVehicleModels(extractData<VehicleModelOption>(vehicleModelsResponse));
      setStations(extractData<StationOption>(stationsResponse));
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  }, []);

  // Effect အတွင်း async ကို လုံခြုံစွာခေါ်ယူခြင်း (React Hooks Error ဖြေရှင်းပြီး)
  useEffect(() => {
    const runFetch = async () => {
      await fetchOptions();
    };
    runFetch();
  }, [fetchOptions]);

  return (
    <form id="tripForm" onSubmit={handleSubmit(onSubmit)}>
      <FormCard title="TRIP ASSIGNMENT" icon={faMap}>
        <div className={styles.filterContainer}>
          <DropdownInput
            label="Route"
            placeholder="Select Route"
            options={routes.map((route) => ({
              id: route.id,
              name: route.route_name || route.name || "Unknown Route",
            }))}
            {...register("route_id", { required: "Route is required" })}
            error={errors.route_id?.message}
          />

          <DropdownInput
            label="Vehicle Model"
            placeholder="Select Vehicle Model"
            options={vehicleModels.map((model) => ({
              id: model.id,
              name:
                model.vehicle_model_name ||
                model.model_name ||
                model.name ||
                "Unknown Model",
            }))}
            {...register("vehicle_model_id", {
              required: "Vehicle Model is required",
            })}
            error={errors.vehicle_model_id?.message}
          />

          <DropdownInput
            label="Station"
            placeholder="Select Station"
            options={stations.map((station) => ({
              id: station.id,
              name: station.station_name || station.name || "Unknown Station",
            }))}
            {...register("station_id", { required: "Station is required" })}
            error={errors.station_id?.message}
          />

          <TextInput
            label="Daily Trip Rate"
            rightIcon={faMoneyBill}
            placeholder="Enter Daily Trip Rate"
            {...register("daily_trip_rate", {
              required: "Daily Trip Rate is required",
            })}
            error={errors.daily_trip_rate?.message}
          />

          <TextInput
            label="Overnight Trip Rate"
            rightIcon={faMoneyBill}
            placeholder="Enter Overnight Trip Rate"
            {...register("overnight_trip_rate", {
              required: "Overnight Trip Rate is required",
            })}
            error={errors.overnight_trip_rate?.message}
          />

          <div className={styles.formActionArea}>
            <NavigationBtn
              href="#"
              variant="cancel"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
            >
              cancel
            </NavigationBtn>

            <ActionBtn
              type="submit"
              form="tripForm"
              leftIcon={faCircleCheck}
              disabled={loading}
            >
              {mode === "create" ? "Create Trip" : "Update Trip"}
            </ActionBtn>
          </div>
        </div>
      </FormCard>
    </form>
  );
};
