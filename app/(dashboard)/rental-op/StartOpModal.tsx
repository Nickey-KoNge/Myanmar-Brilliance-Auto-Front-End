import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { apiClient } from "../../features/lib/api-client";
import styles from "./rentalOpPage.module.css";
import { Route, VehicleAssign, ActiveOp } from "./types";
import { getInitialVehicleOdo } from "./utils";

interface Props {
  assign: VehicleAssign;
  routesList: Route[];
  selectedStationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StartOpModal({
  assign,
  routesList,
  selectedStationId,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [activeOpId, setActiveOpId] = useState<string | null>(null);
  const [startOdoValue, setStartOdoValue] = useState<number>(0);

  const [vehicleImg, setVehicleImg] = useState<string>("/placeholder-car.png");
  const [driverImg, setDriverImg] = useState<string>("/placeholder-driver.png");

  const [opRouteId, setOpRouteId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [tripsDay, setTripsDay] = useState("");
  const [overnightCount, setOvernightCount] = useState("");

  const selectedRouteObj = routesList.find((rt) => rt.id === opRouteId);
  const isCityTrip = selectedRouteObj?.route_name
    ?.toLowerCase()
    .includes("city");

  useEffect(() => {
    setVehicleImg(assign.vehicle_image || "/placeholder-car.png");
    setDriverImg(assign.driver_image || "/placeholder-driver.png");
    fetchActiveOperation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assign]);

  const fetchActiveOperation = async () => {
    const vId = assign.vehicle?.id || assign.vehicle_id;
    if (!vId) return;

    try {
      const res = await apiClient.get(
        `/master-rental/rental-operation?vehicle_id=${vId}&status=Active`,
      );
      const resObj = res as unknown as {
        items?: Record<string, unknown>[];
        data?: Record<string, unknown>[];
      };
      let ops: Record<string, unknown>[] = [];

      if (Array.isArray(resObj.items)) ops = resObj.items;
      else if (Array.isArray(resObj.data)) ops = resObj.data;

      if (ops.length > 0) {
        const activeOp = ops[0] as unknown as ActiveOp;
        setActiveOpId(String(activeOp.id));

        if (activeOp.vehicle_image_url)
          setVehicleImg(activeOp.vehicle_image_url);
        if (activeOp.driver_image_url) setDriverImg(activeOp.driver_image_url);

        if (activeOp.route_id) setOpRouteId(String(activeOp.route_id));
        if (activeOp.start_time) {
          const stDate = new Date(String(activeOp.start_time));
          const tzOffset = stDate.getTimezoneOffset() * 60000;
          setStartTime(
            new Date(stDate.getTime() - tzOffset).toISOString().slice(0, 16),
          );
        }
        if (activeOp.daily_count) setTripsDay(String(activeOp.daily_count));
        if (activeOp.overnight_count)
          setOvernightCount(String(activeOp.overnight_count));

        const opStartOdo =
          activeOp.start_odo && activeOp.start_odo !== "0"
            ? Number(activeOp.start_odo)
            : Number(getInitialVehicleOdo(assign));
        setStartOdoValue(opStartOdo);
      } else {
        setActiveOpId(null);
        setStartOdoValue(Number(getInitialVehicleOdo(assign)));
      }
    } catch (err) {
      console.error(err);
      setStartOdoValue(Number(getInitialVehicleOdo(assign)));
    }
  };

  const handleSaveOngoing = async () => {
    if (!opRouteId) return toast.error("Route အပြည့်အစုံ ဖြည့်ပေးပါ။");
    if (startTime && isCityTrip && !tripsDay)
      return toast.error("City Trip အတွက် Trips Day ကို ဖြည့်ပေးပါ။");
    if (startTime && !isCityTrip && !overnightCount)
      return toast.error(
        "Overnight Trip အတွက် Overnight Count ကို ဖြည့်ပေးပါ။",
      );

    try {
      setLoading(true);
      toast.loading("Saving Ongoing Data...", { id: "save-start" });

      const vId = assign.vehicle?.id || assign.vehicle_id;
      const dId = assign.driver?.id || assign.driver_id;

      const opPayload: Record<string, unknown> = {
        route_id: opRouteId,
        start_time: startTime ? new Date(startTime).toISOString() : null,
        daily_count: isCityTrip ? tripsDay.slice(0, 2) : null,
        start_odo: String(startOdoValue),
        overnight_count: !isCityTrip ? overnightCount.slice(0, 2) : null,
        trip_status: startTime ? "Ongoing" : "Pending",
        status: "Active",
      };

      if (activeOpId) {
        await apiClient.patch(
          `/master-rental/rental-operation/${activeOpId}`,
          opPayload,
        );
      } else {
        Object.assign(opPayload, {
          station_id: selectedStationId,
          vehicle_id: vId,
          driver_id: dId,
        });
        await apiClient.post("/master-rental/rental-operation", opPayload);
      }

      toast.success("Ongoing Data Saved!", { id: "save-start" });
      onSuccess();
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(
        err?.response?.data?.message || "Failed to save start operation",
        { id: "save-start" },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.largeModalOverlay}>
      <div className={styles.smallModalContent}>
        <div className={`${styles.flexBetween} ${styles.headerRow}`}>
          <div className={styles.flexGap}>
            <div className={styles.iconBox}>🛫</div>
            <h2 className={styles.modalTitle}>Start Trip Operation</h2>
          </div>
        </div>

        <div className={styles.flexCol}>
          {/* Vehicle & Driver Info */}
          <div className={styles.panel}>
            <div className={styles.flexGap30}>
              <div>
                <Image
                  src={vehicleImg}
                  alt="car"
                  width={120}
                  height={80}
                  unoptimized
                  className={styles.imgBox}
                />
                <div className={styles.primaryTextBold}>
                  {assign.vehicle?.license_plate || assign.license_plate || "-"}
                </div>
                <div className={styles.mutedText}>
                  {assign.vehicle?.vehicle_name ||
                    assign.vehicle_name ||
                    "Unknown"}
                </div>
              </div>
              <div>
                <Image
                  src={driverImg}
                  alt="driver"
                  width={80}
                  height={80}
                  unoptimized
                  className={styles.imgBox}
                />
                <div className={styles.primaryTextBold}>
                  {assign.driver?.driver_name ||
                    assign.driver_name ||
                    "Unknown"}
                </div>
                <div className={styles.mutedText}>
                  {assign.driver?.phone || assign.phone || "09-xxxxxxxxx"}
                </div>
              </div>
            </div>
          </div>

          {/* Start Assignment */}
          <div className={styles.panel}>
            <h3 className={styles.panelHeader}>
              <span className={styles.panelIcon}>| 🛫</span> START TRIPS
              ASSIGNMENT
            </h3>
            <div className={`${styles.flexGap} ${styles.marginBottom15}`}>
              <div className={styles.flex1}>
                <label className={styles.inputLabel}>Start Time</label>
                <input
                  type="datetime-local"
                  className={styles.selectBox}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className={styles.flex1}>
                <label className={styles.inputLabel}>Routes</label>
                <select
                  className={styles.selectBox}
                  value={opRouteId}
                  onChange={(e) => setOpRouteId(e.target.value)}
                >
                  <option value="">All Routes</option>
                  {routesList.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.route_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              {isCityTrip ? (
                <div>
                  <label className={styles.inputLabel}>
                    Trips Day (Daily Count)
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    className={`${styles.selectBox} ${styles.halfWidthInput}`}
                    value={tripsDay}
                    onChange={(e) => setTripsDay(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <label className={styles.inputLabel}>Overnight Count</label>
                  <input
                    type="number"
                    placeholder="0"
                    className={`${styles.selectBox} ${styles.halfWidthInput}`}
                    value={overnightCount}
                    onChange={(e) => setOvernightCount(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Centered at the Bottom */}
        <div className={styles.actionButtonsCenter}>
          <button className={styles.btnCancel} onClick={onClose}>
            CANCEL
          </button>
          <button
            className={styles.btnSave}
            onClick={handleSaveOngoing}
            disabled={loading}
          >
            ✔️ SAVE ONGOING
          </button>
        </div>
      </div>
    </div>
  );
}
