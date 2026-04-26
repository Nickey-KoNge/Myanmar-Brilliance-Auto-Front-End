import React, { useState } from "react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { apiClient } from "../../features/lib/api-client";
import styles from "./rentalOpPage.module.css";

// ဒီနေရာမှာ onSuccess ကို Promise<void> လက်ခံနိုင်အောင် ပြင်ပေးထားပါတယ်
interface Props {
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export default function AddRouteModal({ onClose, onSuccess }: Props) {
  const [routeName, setRouteName] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");

  const handleCreateRoute = async () => {
    if (!routeName || !startLocation || !endLocation) {
      toast.error("Please fill all route fields.");
      return;
    }
    try {
      toast.loading("Creating Route...", { id: "create-route" });
      await apiClient.post("/master-trips/routes", {
        route_name: routeName,
        start_location: startLocation,
        end_location: endLocation,
      });
      toast.success("Route created successfully!", { id: "create-route" });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError?.response?.data?.message || "Failed to create Route",
        { id: "create-route" },
      );
    }
  };

  return (
    <div className={styles.largeModalOverlay}>
      <div className={styles.smallModalContent}>
        <h2 className={`${styles.modalTitle} ${styles.marginBottom15}`}>
          Add New Route
        </h2>

        <div className={styles.flexCol}>
          <input
            placeholder="Route Name"
            className={styles.selectBox}
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
          />
          <input
            placeholder="Start Location"
            className={styles.selectBox}
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
          />
          <input
            placeholder="End Location"
            className={styles.selectBox}
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
          />
        </div>

        <div className={`${styles.flexGap} ${styles.actionButtonsRow}`}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.btnSave} onClick={handleCreateRoute}>
            Save Route
          </button>
        </div>
      </div>
    </div>
  );
}
