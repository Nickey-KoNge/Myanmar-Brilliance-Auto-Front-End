import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { apiClient } from "../../features/lib/api-client";
import styles from "./rentalOpPage.module.css";
import { Route, VehicleAssign, ActiveOp } from "./types";
import {
  calculateConsumedDays,
  formatExtraTime,
  getInitialVehicleOdo,
} from "./utils";

interface Props {
  assign: VehicleAssign;
  routesList: Route[];
  selectedStationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OpEntryModal({
  assign,
  routesList,
  selectedStationId,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [activeOpId, setActiveOpId] = useState<string | null>(null);
  const [startOdoValue, setStartOdoValue] = useState<number>(0);

  // 🛑 ပုံ URL သိမ်းရန် States
  const [vehicleImg, setVehicleImg] = useState<string>("/placeholder-car.png");
  const [driverImg, setDriverImg] = useState<string>("/placeholder-driver.png");

  const [opRouteId, setOpRouteId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [tripsDay, setTripsDay] = useState("");
  const [endTime, setEndTime] = useState("");
  const [endOdo, setEndOdo] = useState("");
  const [endBattery, setEndBattery] = useState("");
  const [description, setDescription] = useState("");
  const [chargingKw, setChargingKw] = useState("");
  const [chargingAmount, setChargingAmount] = useState("");
  const [overnightCount, setOvernightCount] = useState("");
  const [powerStationName, setPowerStationName] = useState("");

  const [overtimeDistance, setOvertimeDistance] = useState("");
  const [extraTime, setExtraTime] = useState("");

  const selectedRouteObj = routesList.find((rt) => rt.id === opRouteId);
  const isCityTrip = selectedRouteObj?.route_name
    ?.toLowerCase()
    .includes("city");

  useEffect(() => {
    
    setVehicleImg(
      assign.vehicle_image || "/placeholder-car.png",
    );
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
          setTripsDay("1");
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
          const consumedDays = calculateConsumedDays(startTime, endTime);
          setOvernightCount(consumedDays > 0 ? String(consumedDays) : "0");
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
        // ActiveOp အမျိုးအစားဖြင့် သတ်မှတ်ပေးခြင်း
        const activeOp = ops[0] as unknown as ActiveOp;
        setActiveOpId(String(activeOp.id));

        // 🛑 အကယ်၍ Active Operation တွင် ပုံအသစ်ပါလာပါက ပုံကို Update ထပ်လုပ်ပါမည်
        if (activeOp.vehicle_image) setVehicleImg(activeOp.vehicle_image);
        if (activeOp.driver_image) setDriverImg(activeOp.driver_image);

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

  const handleSaveOperation = async (isFinalize: boolean) => {
    if (!opRouteId) return toast.error("Route အပြည့်အစုံ ဖြည့်ပေးပါ။");
    if (startTime && isCityTrip && !tripsDay)
      return toast.error("City Trip အတွက် Trips Day ကို ဖြည့်ပေးပါ။");
    if (startTime && !isCityTrip && !overnightCount)
      return toast.error(
        "Overnight Trip အတွက် Overnight Count ကို ဖြည့်ပေးပါ။",
      );
    if (isFinalize && (!startTime || !endTime || !endOdo || !endBattery))
      return toast.error("Finalize လုပ်ရန် အချက်အလက်များ အပြည့်အစုံထည့်ပေးပါ။");

    try {
      setLoading(true);
      toast.loading(
        isFinalize ? "Finalizing Trip..." : "Saving Ongoing Data...",
        { id: "save-op" },
      );

      const vId = assign.vehicle?.id || assign.vehicle_id;
      const dId = assign.driver?.id || assign.driver_id;

      const opPayload: Record<string, unknown> = {
        route_id: opRouteId,
        start_time: startTime ? new Date(startTime).toISOString() : null,
        daily_count: isCityTrip ? tripsDay.slice(0, 2) : null,
        start_odo: String(startOdoValue),
        power_station_name: powerStationName.slice(0, 50),
        overnight_count: !isCityTrip ? overnightCount.slice(0, 2) : null,
      };

      if (isFinalize) {
        Object.assign(opPayload, {
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
        });
      } else {
        opPayload.trip_status = startTime ? "Ongoing" : "Pending";
        opPayload.status = "Active";
      }

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

      if (isFinalize && !isCityTrip) {
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

      toast.success(
        isFinalize ? "Trip Finalized Successfully!" : "Ongoing Data Saved!",
        { id: "save-op" },
      );
      onSuccess();
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(
        err?.response?.data?.message || "Failed to process operation",
        { id: "save-op" },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.largeModalOverlay}>
      <div className={styles.largeModalContent}>
        <div
          className={`${styles.flexBetween}`}
          style={{ marginBottom: "20px" }}
        >
          <div className={styles.flexGap}>
            <div
              style={{
                backgroundColor: "#d9534f",
                padding: "8px 12px",
                borderRadius: "8px",
              }}
            >
              🚗
            </div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "bold" }}>
              Trips Operation
            </h2>
          </div>
          <div className={styles.flexGap}>
            <button className={styles.btnCancel} onClick={onClose}>
              CANCEL
            </button>
            <button
              className={styles.btnSaveOngoing}
              onClick={() => handleSaveOperation(false)}
              disabled={loading}
            >
              ✔️ SAVE ONGOING
            </button>
            <button
              className={styles.btnFinalize}
              onClick={() => handleSaveOperation(true)}
              disabled={loading}
            >
              ✅ FINALIZE TRIPS
            </button>
          </div>
        </div>

        <div className={styles.grid2Col}>
          {/* Left Column */}
          <div className={styles.flexCol}>
            <div className={styles.panel}>
              <div className={styles.flexGap30}>
                <div>
                  {/* 🛑 ဤနေရာတွင် State မှ ပုံ URL ကို အသုံးပြုပါမည် */}
                  <Image
                    src={vehicleImg}
                    alt="car"
                    width={120}
                    height={80}
                    unoptimized // 👈 External Link များအတွက်
                    className={styles.imgBox}
                  />
                  <div
                    style={{
                      color: "#d9534f",
                      fontWeight: "bold",
                      marginTop: "10px",
                    }}
                  >
                    {assign.vehicle?.license_plate ||
                      assign.license_plate ||
                      "-"}
                  </div>
                  <div style={{ fontSize: "14px", color: "#ccc" }}>
                    {assign.vehicle?.vehicle_name ||
                      assign.vehicle_name ||
                      "Unknown"}
                  </div>
                </div>
                <div>
                  {/* 🛑 ဤနေရာတွင် State မှ ပုံ URL ကို အသုံးပြုပါမည် */}
                  <Image
                    src={driverImg}
                    alt="driver"
                    width={80}
                    height={80}
                    unoptimized // 👈 External Link များအတွက်
                    className={styles.imgBox}
                  />
                  <div
                    style={{
                      color: "#d9534f",
                      fontWeight: "bold",
                      marginTop: "10px",
                    }}
                  >
                    {assign.driver?.driver_name ||
                      assign.driver_name ||
                      "Unknown"}
                  </div>
                  <div style={{ fontSize: "14px", color: "#ccc" }}>
                    {assign.driver?.phone || assign.phone || "09-xxxxxxxxx"}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.panel}>
              <h3 className={styles.panelHeader}>
                <span style={{ color: "#d9534f", marginRight: "8px" }}>
                  | 🛫
                </span>{" "}
                START TRIPS ASSIGNMENT
              </h3>
              <div className={styles.flexGap} style={{ marginBottom: "15px" }}>
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
                      className={styles.selectBox}
                      style={{ width: "50%" }}
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
                      className={styles.selectBox}
                      style={{ width: "50%" }}
                      value={overnightCount}
                      onChange={(e) => setOvernightCount(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={styles.panel}>
              <h3 className={styles.panelHeader}>
                <span style={{ color: "#d9534f", marginRight: "8px" }}>
                  | 🔌
                </span>{" "}
                CHARGING INFO ASSIGNMENT
              </h3>
              <div style={{ marginBottom: "15px" }}>
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

          {/* Right Column */}
          <div className={styles.flexCol}>
            <div className={`${styles.panel} ${styles.flex1}`}>
              <h3 className={styles.panelHeader}>
                <span style={{ color: "#d9534f", marginRight: "8px" }}>
                  | 🛬
                </span>{" "}
                END TRIPS ASSIGNMENT
              </h3>
              <div className={styles.flexGap} style={{ marginBottom: "15px" }}>
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
              <div style={{ marginBottom: "15px" }}>
                <label className={styles.inputLabel}>End Battery</label>
                <input
                  type="number"
                  placeholder="89"
                  className={styles.selectBox}
                  style={{ width: "50%" }}
                  value={endBattery}
                  onChange={(e) => setEndBattery(e.target.value)}
                />
              </div>
              <div className={styles.flex1}>
                <label className={styles.inputLabel}>Description</label>
                <textarea
                  placeholder="Enter Description...."
                  className={styles.selectBox}
                  style={{ height: "130px", resize: "none" }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.panel}>
              <h3 className={styles.panelHeader}>
                <span style={{ color: "#d9534f", marginRight: "8px" }}>
                  | ⏱️
                </span>{" "}
                OVERTIME ASSIGNMENT
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
      </div>
    </div>
  );
}
