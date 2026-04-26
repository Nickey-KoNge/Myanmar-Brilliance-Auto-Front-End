import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { apiClient } from "../../features/lib/api-client";
import styles from "./rentalOpPage.module.css";
import { Route, VehicleAssign, ActiveOp } from "./types";
import { formatExtraTime, getInitialVehicleOdo } from "./utils";

interface Props {
  assign: VehicleAssign;
  routesList: Route[];
  selectedStationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EndOpModal({
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

  const [endTime, setEndTime] = useState("");
  const [endOdo, setEndOdo] = useState("");
  const [endBattery, setEndBattery] = useState("");
  const [description, setDescription] = useState("");
  const [chargingKw, setChargingKw] = useState("");
  const [chargingAmount, setChargingAmount] = useState("");
  const [powerStationName, setPowerStationName] = useState("");

  const [overtimeDistance, setOvertimeDistance] = useState("");
  const [extraTime, setExtraTime] = useState("");

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

  useEffect(() => {
    if (endOdo && startOdoValue > 0) {
      const distance = Number(endOdo) - startOdoValue;
      setOvertimeDistance(distance > 0 ? String(distance).slice(0, 5) : "0");
    }

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (end > start) {
        if (isCityTrip) {
          const benchmarkLimit = new Date(
            start.getTime() + 12 * 60 * 60 * 1000,
          );
          if (end > benchmarkLimit) {
            setExtraTime(
              formatExtraTime(end.getTime() - benchmarkLimit.getTime()),
            );
          } else {
            setExtraTime("0");
          }
        } else {
          const diffHrs = Math.floor(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60),
          );
          setExtraTime(String(diffHrs));
        }
      } else {
        setExtraTime("0");
      }
    }
  }, [endOdo, startOdoValue, startTime, endTime, isCityTrip]);

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
        if (activeOp.power_station_name)
          setPowerStationName(String(activeOp.power_station_name));

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

  const handleFinalize = async () => {
    if (!activeOpId)
      return toast.error(
        "Finalize လုပ်ရန် Active Trip မရှိပါ။ အရင် Start Trip လုပ်ပါ။",
      );
    if (!endTime || !endOdo || !endBattery)
      return toast.error("Finalize လုပ်ရန် အချက်အလက်များ အပြည့်အစုံထည့်ပေးပါ။");

    try {
      setLoading(true);
      toast.loading("Finalizing Trip...", { id: "finalize-op" });

      const vId = assign.vehicle?.id || assign.vehicle_id;
      const dId = assign.driver?.id || assign.driver_id;

      const opPayload = {
        power_station_name: powerStationName.slice(0, 50),
        end_time: new Date(endTime).toISOString(),
        end_odo: endOdo.slice(0, 10),
        end_battery: endBattery.slice(0, 3),
        description: description.slice(0, 255),
        kw: chargingKw.slice(0, 10),
        amount: chargingAmount.slice(0, 20),
        distance: overtimeDistance.slice(0, 5),
        extra_hours: extraTime.slice(0, 20),
        trip_status: "Completed",
        status: "Inactive",
      };

      await apiClient.patch(
        `/master-rental/rental-operation/${activeOpId}`,
        opPayload,
      );

      // Create Pending Trip for Non-City Route
      if (!isCityTrip) {
        await apiClient.post("/master-rental/rental-operation", {
          route_id: opRouteId,
          vehicle_id: vId,
          driver_id: dId,
          station_id: selectedStationId,
          start_odo: endOdo.slice(0, 10),
          start_battery: endBattery.slice(0, 3),
          trip_status: "Pending",
          status: "Active",
        });
      }

      toast.success("Trip Finalized Successfully!", { id: "finalize-op" });
      onSuccess();
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(
        err?.response?.data?.message || "Failed to finalize operation",
        { id: "finalize-op" },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.largeModalOverlay}>
      <div className={styles.largeModalContent}>
        {/* Header Section */}
        <div className={`${styles.flexBetween} ${styles.marginBottom20}`}>
          <div className={styles.flexGap}>
            <div className={styles.iconBoxEnd}>🛬</div>
            <h2 className={styles.modalTitleLarge}>
              End Trip & Charging Station
            </h2>
          </div>
        </div>

        <div className={styles.grid2Col}>
          {/* Left Column (Added height: 100% to fill grid) */}
          <div className={styles.flexCol} style={{ height: "100%" }}>
            {/* Vehicle Info */}
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
                    {assign.vehicle?.license_plate ||
                      assign.license_plate ||
                      "-"}
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

            {/* Charging Info (Added flex1 to stretch vertically) */}
            <div
              className={`${styles.panel} ${styles.flex1}`}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <h3 className={styles.panelHeader}>
                <span className={styles.panelIcon}>| 🔌</span> CHARGING INFO
                ASSIGNMENT
              </h3>
              <div className={styles.marginBottom15}>
                <label className={styles.inputLabel}>Power Station Name</label>
                <input
                  type="text"
                  placeholder="e.g. Earth Power Station"
                  className={styles.selectBox}
                  value={powerStationName}
                  onChange={(e) => setPowerStationName(e.target.value)}
                />
              </div>
              <div className={styles.flexGap}>
                <div className={styles.flex1}>
                  <label className={styles.inputLabel}>KW</label>
                  <input
                    type="number"
                    placeholder="e.g. 123"
                    className={styles.selectBox}
                    value={chargingKw}
                    onChange={(e) => setChargingKw(e.target.value)}
                  />
                </div>
                <div className={styles.flex1}>
                  <label className={styles.inputLabel}>Total Amount</label>
                  <input
                    type="number"
                    placeholder="Enter Amount"
                    className={styles.selectBox}
                    value={chargingAmount}
                    onChange={(e) => setChargingAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Added height: 100% to fill grid) */}
          <div className={styles.flexCol} style={{ height: "100%" }}>
            {/* End Trips Assignment (Added flex1 and flex-direction to stretch) */}
            <div
              className={`${styles.panel} ${styles.flex1}`}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <h3 className={styles.panelHeader}>
                <span className={styles.panelIcon}>| 🛬</span> END TRIPS
                ASSIGNMENT
              </h3>
              <div className={`${styles.flexGap} ${styles.marginBottom15}`}>
                <div className={styles.flex1}>
                  <label className={styles.inputLabel}>End Times</label>
                  <input
                    type="datetime-local"
                    className={styles.selectBox}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
                <div className={styles.flex1}>
                  <label className={styles.inputLabel}>End Odo</label>
                  <input
                    type="number"
                    placeholder="e.g. 291922"
                    className={styles.selectBox}
                    value={endOdo}
                    onChange={(e) => setEndOdo(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.marginBottom15}>
                <label className={styles.inputLabel}>End Battery</label>
                <input
                  type="number"
                  placeholder="89"
                  className={`${styles.selectBox} ${styles.halfWidthInput}`}
                  value={endBattery}
                  onChange={(e) => setEndBattery(e.target.value)}
                />
              </div>
              {/* Description box stretched to fill space beautifully */}
              <div
                className={styles.flex1}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <label className={styles.inputLabel}>Description</label>
                <textarea
                  placeholder="Enter Description...."
                  className={styles.selectBox}
                  style={{ flex: 1, resize: "none", minHeight: "80px" }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Overtime */}
            <div className={styles.panel}>
              <h3 className={styles.panelHeader}>
                <span className={styles.panelIcon}>| ⏱️</span> OVERTIME
                ASSIGNMENT
              </h3>
              <div className={styles.flexGap}>
                <div className={styles.flex1}>
                  <label className={styles.inputLabel}>Distance (KM)</label>
                  <input
                    type="text"
                    readOnly
                    className={`${styles.selectBox} ${styles.readonlyText}`}
                    value={overtimeDistance ? `${overtimeDistance} km` : "- km"}
                  />
                </div>
                <div className={styles.flex1}>
                  <label className={styles.inputLabel}>
                    Extra Time (Hours)
                  </label>
                  <input
                    type="text"
                    readOnly
                    className={`${styles.selectBox} ${styles.readonlyText}`}
                    value={extraTime ? extraTime : "0"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons Centered at the Bottom */}
        <div className={styles.actionButtonsCenter}>
          <button className={styles.btnCancel} onClick={onClose}>
            CANCEL
          </button>
          <button
            className={styles.btnFinalize}
            onClick={handleFinalize}
            disabled={loading}
          >
            ✅ FINALIZE TRIPS
          </button>
        </div>
      </div>
    </div>
  );
}
