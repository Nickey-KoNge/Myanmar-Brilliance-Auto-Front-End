import React, { useState } from "react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { apiClient } from "../../features/lib/api-client";
import styles from "./rentalOpPage.module.css";
import { Route, Station, VehicleModel } from "./types";

interface Props {
  routesList: Route[];
  stationsList: Station[];
  vehicleModelsList: VehicleModel[];
  onClose: () => void;
}

export default function AddTripPriceModal({
  routesList,
  stationsList,
  vehicleModelsList,
  onClose,
}: Props) {
  const [tpRouteId, setTpRouteId] = useState("");
  const [tpStationId, setTpStationId] = useState("");
  const [tpVehicleModelId, setTpVehicleModelId] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [overnightRate, setOvernightRate] = useState("");

  const handleCreateTripPrice = async () => {
    if (
      !tpRouteId ||
      !tpVehicleModelId ||
      !tpStationId ||
      !dailyRate ||
      !overnightRate
    ) {
      toast.error("Please fill all trip price fields.");
      return;
    }
    try {
      toast.loading("Creating Trip Price...", { id: "create-tp" });
      await apiClient.post("/master-trips/trip-prices", {
        route_id: tpRouteId,
        vehicle_model_id: tpVehicleModelId,
        station_id: tpStationId,
        daily_trip_rate: dailyRate,
        overnight_trip_rate: overnightRate,
      });
      toast.success("Trip Price created successfully!", { id: "create-tp" });
      onClose();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError?.response?.data?.message || "Failed to create Trip Price",
        { id: "create-tp" },
      );
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 style={{ marginBottom: 15, fontWeight: "bold" }}>Add Trip Price</h2>
        <select
          className={styles.selectBox}
          style={{ marginBottom: 10 }}
          value={tpRouteId}
          onChange={(e) => setTpRouteId(e.target.value)}
        >
          <option value="">Select Route</option>
          {routesList.map((rt) => (
            <option key={rt.id} value={rt.id}>
              {rt.route_name}
            </option>
          ))}
        </select>
        <select
          className={styles.selectBox}
          style={{ marginBottom: 10 }}
          value={tpStationId}
          onChange={(e) => setTpStationId(e.target.value)}
        >
          <option value="">Select Station</option>
          {stationsList.map((st) => (
            <option key={st.id} value={st.id}>
              {st.station_name}
            </option>
          ))}
        </select>
        <select
          className={styles.selectBox}
          style={{ marginBottom: 10 }}
          value={tpVehicleModelId}
          onChange={(e) => setTpVehicleModelId(e.target.value)}
        >
          <option value="">Select Vehicle Model</option>
          {vehicleModelsList.map((vm) => (
            <option key={vm.id} value={vm.id}>
              {vm.vehicle_model_name}
            </option>
          ))}
        </select>
        <input
          placeholder="Daily Trip Rate"
          type="number"
          className={styles.selectBox}
          style={{ marginBottom: 10 }}
          value={dailyRate}
          onChange={(e) => setDailyRate(e.target.value)}
        />
        <input
          placeholder="Overnight Trip Rate"
          type="number"
          className={styles.selectBox}
          value={overnightRate}
          onChange={(e) => setOvernightRate(e.target.value)}
        />
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: 20,
          }}
        >
          <button
            className={styles.btnPrimary}
            style={{ backgroundColor: "#555" }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button className={styles.btnPrimary} onClick={handleCreateTripPrice}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
