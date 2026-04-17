"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import styles from "./rentalOpPage.module.css";
import {
  RentalOpCard,
  RentalOperationData,
} from "../../components/RentalOpCard/RentalOpCard";
import { apiClient } from "../../features/lib/api-client";
import Image from "next/image";

// ================= TYPES =================
interface Station {
  id: string;
  station_name: string;
}
interface Route {
  id: string;
  route_name: string;
}
interface VehicleModel {
  id: string;
  vehicle_model_name: string;
}

interface VehicleAssign {
  id: string;
  vehicle_id?: string;
  driver_id?: string;
  vehicle?: {
    id: string;
    vehicle_name: string;
    license_plate?: string;
    current_odometer?: string;
  };
  driver?: { id: string; driver_name: string; phone?: string };
  station?: { id: string; station_name: string; branch_name?: string };
  vehicle_name?: string;
  license_plate?: string;
  driver_name?: string;
  phone?: string;
  station_name?: string;
  branch_name?: string;
}

interface ActiveOp {
  id: string;
  vehicle_id?: string;
  vehicle?: { id: string };
  route_name?: string;
  route?: { route_name: string };
  trip_status?: string;
  start_odo?: string;
  start_battery?: string;
  end_odo?: string;
  extra_hours?: string;
  kw?: string;
  amount?: string;
  branch_name?: string;
  station?: { branch?: { branch_name: string } };
}
const getInitialVehicleOdo = (assign: VehicleAssign): string => {
  if (assign.vehicle?.current_odometer)
    return String(assign.vehicle.current_odometer);
  return "0";
};

export default function RentalOperationPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Lists & Dropdowns
  const [stationsList, setStationsList] = useState<Station[]>([]);
  const [routesList, setRoutesList] = useState<Route[]>([]);
  const [vehicleModelsList, setVehicleModelsList] = useState<VehicleModel[]>(
    [],
  );

  const [selectedStationId, setSelectedStationId] = useState("");
  const [assignList, setAssignList] = useState<VehicleAssign[]>([]);
  const [activeOperations, setActiveOperations] = useState<ActiveOp[]>([]);

  // ================= MODAL STATES =================
  const [showOpEntryModal, setShowOpEntryModal] = useState(false);
  const [selectedAssign, setSelectedAssign] = useState<VehicleAssign | null>(
    null,
  );

  // 🛑 API မှရလာသော လက်ရှိ Active Operation ID နှင့် Start Data များ သိမ်းရန်
  const [activeOpId, setActiveOpId] = useState<string | null>(null);
  const [startOdoValue, setStartOdoValue] = useState<number>(0);

  // -- Form States --
  const [opRouteId, setOpRouteId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [tripsDay, setTripsDay] = useState("");

  const [endTime, setEndTime] = useState("");
  const [endOdo, setEndOdo] = useState("");
  const [endBattery, setEndBattery] = useState("");
  const [description, setDescription] = useState("");

  const [chargingKw, setChargingKw] = useState("");
  const [chargingAmount, setChargingAmount] = useState("");

  const [overtimeDistance, setOvertimeDistance] = useState("");
  const [extraTime, setExtraTime] = useState("");

  // Route & Trip Price Form State
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showTripPriceModal, setShowTripPriceModal] = useState(false);
  const [routeName, setRouteName] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [tpRouteId, setTpRouteId] = useState("");
  const [tpVehicleModelId, setTpVehicleModelId] = useState("");
  const [tpStationId, setTpStationId] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [overnightRate, setOvernightRate] = useState("");

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (selectedStationId) {
      fetchAssignmentsByStation(selectedStationId);
    } else {
      setAssignList([]);
    }
  }, [selectedStationId]);

  // 🛑 Auto Calculate Logic
  useEffect(() => {
    if (endOdo && startOdoValue > 0) {
      const distance = Number(endOdo) - startOdoValue;
      const distStr = distance > 0 ? String(distance) : "0";
      setOvertimeDistance(distStr.slice(0, 5));
    }

    if (startTime && endTime) {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      if (end > start) {
        const diffMs = end - start;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        setExtraTime(String(diffHrs).slice(0, 2));
      } else {
        setExtraTime("0");
      }
    }
  }, [endOdo, startOdoValue, startTime, endTime]);

  const fetchDropdownData = async () => {
    try {
      const [stationsRes, routesRes, modelsRes] = await Promise.all([
        apiClient.get("/master-company/stations"),
        apiClient.get("/master-trips/routes"),
        apiClient.get("/master-vehicle/vehicle-models?limit=1000"),
      ]);

      const extractData = <T,>(res: unknown): T[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res as T[];
        const obj = res as unknown as Record<string, unknown>;
        if (Array.isArray(obj.items)) return obj.items as T[];
        if (Array.isArray(obj.data)) return obj.data as T[];
        if (obj.data && typeof obj.data === "object") {
          const nested = obj.data as Record<string, unknown>;
          if (Array.isArray(nested.items)) return nested.items as T[];
        }
        return [];
      };

      setStationsList(extractData<Station>(stationsRes));
      setRoutesList(extractData<Route>(routesRes));
      setVehicleModelsList(extractData<VehicleModel>(modelsRes));
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
    }
  };

  const fetchAssignmentsByStation = async (stationId: string) => {
    try {
      setFetching(true);
      // const res = await apiClient.get(
      //   `/master-vehicle/vehicle-driver-assign?station_id=${stationId}&status=Ongoing`,
      // );
      const [assignRes, opRes] = await Promise.all([
        apiClient.get(
          `/master-vehicle/vehicle-driver-assign?station_id=${stationId}&status=Ongoing`,
        ),
        apiClient.get(
          `/master-rental/rental-operation?station_id=${stationId}&status=Active`,
        ),
      ]);

      // 1. Extract Assign Data
      let assignData: VehicleAssign[] = [];
      if (assignRes) {
        if (Array.isArray(assignRes)) {
          assignData = assignRes as VehicleAssign[];
        } else if (typeof assignRes === "object") {
          const resObj = assignRes as unknown as Record<string, unknown>;
          if (Array.isArray(resObj.items))
            assignData = resObj.items as VehicleAssign[];
          else if (Array.isArray(resObj.data))
            assignData = resObj.data as VehicleAssign[];
          else if (resObj.data && typeof resObj.data === "object") {
            const nested = resObj.data as Record<string, unknown>;
            if (Array.isArray(nested.items))
              assignData = nested.items as VehicleAssign[];
          }
        }
      }

      // Filter Duplicates
      const uniqueAssignData = Array.from(
        new Map(
          assignData.map((item) => {
            const uniqueKey = item.vehicle?.id || item.vehicle_id || item.id;
            return [uniqueKey, item];
          }),
        ).values(),
      );
      // 2. Extract Operations Data
      let opData: ActiveOp[] = [];
      if (opRes) {
        if (Array.isArray(opRes)) {
          opData = opRes as ActiveOp[];
        } else if (typeof opRes === "object") {
          const resObj = opRes as unknown as Record<string, unknown>;
          if (Array.isArray(resObj.items)) opData = resObj.items as ActiveOp[];
          else if (Array.isArray(resObj.data))
            opData = resObj.data as ActiveOp[];
          else if (resObj.data && typeof resObj.data === "object") {
            const nested = resObj.data as Record<string, unknown>;
            if (Array.isArray(nested.items))
              opData = nested.items as ActiveOp[];
          }
        }
      }

      setAssignList(uniqueAssignData);
      setActiveOperations(opData);
    } catch (err) {
      console.error("Fetch Assign Error:", err);
      toast.error("Failed to load assigned vehicles.");
    } finally {
      setFetching(false);
    }
  };

  // 🛑 vId အစား assign အပြည့်အစုံကို parameter အဖြစ် လက်ခံပါမည်
  const fetchActiveOperation = async (assign: VehicleAssign) => {
    const vId = assign.vehicle?.id || assign.vehicle_id;
    if (!vId) return;

    try {
      const res = await apiClient.get(
        `/master-rental/rental-operation?vehicle_id=${vId}&status=Active`,
      );
      console.log("Active Vehicle Odo API Response:", res); // Debugging log

      const resObj = res as unknown as {
        items?: Record<string, unknown>[];
        data?: Record<string, unknown>[];
      };
      let ops: Record<string, unknown>[] = [];

      if (Array.isArray(resObj.items)) ops = resObj.items;
      else if (Array.isArray(resObj.data)) ops = resObj.data;

      if (ops.length > 0) {
        const activeOp = ops[0];
        setActiveOpId(String(activeOp.id));

        if (activeOp.route_id) setOpRouteId(String(activeOp.route_id));
        if (activeOp.start_time) {
          const stDate = new Date(String(activeOp.start_time));
          setStartTime(stDate.toISOString().slice(0, 16));
        }
        if (activeOp.daily_count) setTripsDay(String(activeOp.daily_count));

        // 🛑 (၂) ကြိမ်မြောက်နှင့်အထက်: Active Trip ရဲ့ start_odo ကို သုံးမည်
        const opStartOdo =
          activeOp.start_odo && activeOp.start_odo !== "0"
            ? Number(activeOp.start_odo)
            : Number(getInitialVehicleOdo(assign));
        setStartOdoValue(opStartOdo);
      } else {
        setActiveOpId(null);
        // 🛑 ပထမဆုံးအကြိမ်: Operation မရှိသေးလျှင် Vehicle ရဲ့ Odo ကို start_odo အဖြစ် ယူမည်
        setStartOdoValue(Number(getInitialVehicleOdo(assign)));
      }
    } catch (err) {
      console.error("No active operation found", err);
      // API Error တက်လျှင်လည်း Vehicle Odo ကိုသာ default ယူထားမည်
      setStartOdoValue(Number(getInitialVehicleOdo(assign)));
    }
  };

  const openOpEntryModal = async (assign: VehicleAssign) => {
    setSelectedAssign(assign);

    // Clear all forms
    setOpRouteId("");
    setStartTime("");
    setTripsDay("");
    setEndTime("");
    setEndOdo("");
    setEndBattery("");
    setDescription("");
    setChargingKw("");
    setChargingAmount("");
    setOvertimeDistance("");
    setExtraTime("");
    setActiveOpId(null);

    await fetchActiveOperation(assign);
    setShowOpEntryModal(true);
  };

  // 🛑 Data မရှိလျှင် အသစ်တည်ဆောက်မည်၊ ရှိလျှင် Update လုပ်မည့် Logic
  const handleSaveOperation = async (isFinalize: boolean) => {
    if (!opRouteId || !startTime || !tripsDay) {
      toast.error("Route, Start Time နှင့် Trips Day အပြည့်အစုံ ဖြည့်ပေးပါ။");
      return;
    }

    if (isFinalize && (!endTime || !endOdo || !endBattery)) {
      toast.error(
        "Finalize လုပ်ရန် End Time, End Odo နှင့် End Battery ထည့်ပေးပါ။",
      );
      return;
    }

    try {
      setLoading(true);
      toast.loading(
        isFinalize
          ? "Finalizing Trip & Creating Next Dispatch..."
          : "Saving Ongoing Data...",
        { id: "save-op" },
      );

      const vId = selectedAssign?.vehicle?.id || selectedAssign?.vehicle_id;
      const dId = selectedAssign?.driver?.id || selectedAssign?.driver_id;

      // Create သို့မဟုတ် Update အတွက် Common Payload
      const opPayload: Record<string, unknown> = {
        route_id: opRouteId,
        start_time: startTime ? new Date(startTime).toISOString() : null,
        daily_count: tripsDay.slice(0, 2),
        start_odo: String(startOdoValue),
      };
      console.log("Operation Payload Before Finalize Check:", opPayload); // Debugging log

      if (isFinalize) {
        opPayload.end_time = endTime ? new Date(endTime).toISOString() : null;
        opPayload.end_odo = endOdo.slice(0, 10);
        opPayload.end_battery = endBattery.slice(0, 3);
        opPayload.description = description.slice(0, 255);
        opPayload.kw = chargingKw.slice(0, 10);
        opPayload.amount = chargingAmount.slice(0, 20);
        opPayload.distance = overtimeDistance.slice(0, 5);
        opPayload.extra_hours = extraTime.slice(0, 2);
        opPayload.trip_status = "Completed";
        opPayload.status = "Inactive";
      } else {
        opPayload.trip_status = "Ongoing";
        opPayload.status = "Active";
      }

      // 1. 🛑 Active Operation ID ရှိမရှိ စစ်ဆေးပြီး ရှိလျှင် Update, မရှိလျှင် Create
      if (activeOpId) {
        await apiClient.patch(
          `/master-rental/rental-operation/${activeOpId}`,
          opPayload,
        );
      } else {
        // ID မရှိပါက CREATE အသစ်လုပ်မည် (Station, Vehicle, Driver များကိုပါ ဖြည့်ပေးရမည်)
        opPayload.station_id = selectedStationId;
        opPayload.vehicle_id = vId;
        opPayload.driver_id = dId;
        // opPayload.start_odo = String(startOdoValue);
        await apiClient.post("/master-rental/rental-operation", opPayload);
      }

      // 2. 🛑 Auto Create Next Dispatch (If Finalized)
      if (isFinalize) {
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
        isFinalize
          ? "Trip Finalized & Next Dispatch Created!"
          : "Ongoing Data Saved!",
        { id: "save-op" },
      );
      setShowOpEntryModal(false);
      fetchAssignmentsByStation(selectedStationId);
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(
        err?.response?.data?.message || "Failed to process operation",
        {
          id: "save-op",
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const mapToCardData = (assign: VehicleAssign): RentalOperationData => {
    // 1. Vehicle ID ကို တိကျအောင် ယူပါ
    const vId = assign.vehicle?.id || assign.vehicle_id;

    const activeOp = activeOperations.find((op) => {
      const opVId = op.vehicle?.id || op.vehicle_id;
      return String(opVId) === String(vId);
    });
    const finalBranchName =
      activeOp?.branch_name ||
      activeOp?.station?.branch?.branch_name ||
      assign.station?.branch_name ||
      assign.branch_name ||
      "-";
    const initialOdo = getInitialVehicleOdo(assign);

    return {
      id: assign.id,
      vehicle_name:
        assign.vehicle?.vehicle_name || assign.vehicle_name || "Unknown",
      plate_number:
        assign.vehicle?.license_plate || assign.license_plate || "-",
      driver_name:
        assign.driver?.driver_name || assign.driver_name || "Unknown",
      driver_id: assign.driver?.id || assign.driver_id || "-",
      station_name:
        assign.station?.station_name || assign.station_name || "Unknown",
      branch_name: finalBranchName,

      trip_status: activeOp?.trip_status || "No Trip",
      route_name: activeOp?.route?.route_name || activeOp?.route_name || "-",

      start_odo:
        activeOp?.start_odo && activeOp.start_odo !== "0"
          ? activeOp.start_odo
          : initialOdo !== "0"
            ? initialOdo
            : "-",

      start_battery: activeOp?.start_battery || "-",
      end_odo: activeOp?.end_odo || "-",
      extra_hours: activeOp?.extra_hours || "-",
      kw: activeOp?.kw || "-",
      amount: activeOp?.amount || "-",
    };
  };
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
      setShowRouteModal(false);
      fetchDropdownData();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError?.response?.data?.message || "Failed to create Route",
        { id: "create-route" },
      );
    }
  };

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
      setShowTripPriceModal(false);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError?.response?.data?.message || "Failed to create Trip Price",
        { id: "create-tp" },
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <div className={styles.title}>Operation Entry</div>
          <div className={styles.actionButtons}>
            <select
              className={styles.selectBox}
              style={{ width: "auto", minWidth: "200px" }}
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
            >
              <option value="">-- Select Station --</option>
              {stationsList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.station_name}
                </option>
              ))}
            </select>
            <button
              className={styles.btnPrimary}
              onClick={() => setShowRouteModal(true)}
            >
              + ADD ROUTE
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => setShowTripPriceModal(true)}
            >
              + ADD TRIP PRICE
            </button>
          </div>
        </div>

        {!selectedStationId ? (
          <div className={styles.emptyState}>
            အထက်ပါ Station Dropdown မှ Station ကို ရွေးချယ်ပေးပါ။
          </div>
        ) : fetching ? (
          <div className={styles.emptyState}>Loading Vehicles...</div>
        ) : assignList.length === 0 ? (
          <div className={styles.emptyState}>
            ဤ Station တွင် တာဝန်ချထားသော ကား/ဒရိုင်ဘာ မရှိသေးပါ။
          </div>
        ) : (
          <div>
            {assignList.map((assign, index) => (
              <div
                key={assign.id || index}
                style={{ cursor: "pointer" }}
                onClick={() => openOpEntryModal(assign)}
              >
                <RentalOpCard data={mapToCardData(assign)} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.rightSidebar}>
        <div style={{ marginBottom: "20px", fontWeight: "bold" }}>
          Operation Search
        </div>
        <button
          className={styles.btnPrimary}
          style={{ width: "100%", marginTop: "20px" }}
        >
          Reset Filters
        </button>
      </div>

      {/* ================= 🛑 THE NEW COMPREHENSIVE OPERATION ENTRY MODAL ================= */}
      {showOpEntryModal && (
        <div style={largeModalOverlayStyle}>
          <div style={largeModalContentStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    backgroundColor: "#d9534f",
                    padding: "8px 12px",
                    borderRadius: "8px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>🚗</span>
                </div>
                <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "bold" }}>
                  Trips Operation
                </h2>
              </div>
              <div style={{ display: "flex", gap: "15px" }}>
                <button
                  style={btnCancelStyle}
                  onClick={() => setShowOpEntryModal(false)}
                >
                  CANCEL
                </button>
                <button
                  style={btnSaveOngoingStyle}
                  onClick={() => handleSaveOperation(false)}
                  disabled={loading}
                >
                  ✔️ SAVE ONGOING DATA
                </button>
                <button
                  style={btnFinalizeStyle}
                  onClick={() => handleSaveOperation(true)}
                  disabled={loading}
                >
                  ✅ FINALIZE & NEXT DISPATCH
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {/* LEFT COLUMN */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {/* Vehicle & Driver */}
                <div style={panelStyle}>
                  <div style={{ display: "flex", gap: "30px" }}>
                    <div>
                      <Image
                        src="/placeholder-car.png"
                        alt="car"
                        width={120}
                        height={80}
                        style={{
                          borderRadius: "8px",
                          objectFit: "cover",
                          backgroundColor: "#000",
                        }}
                      />
                      <div
                        style={{
                          color: "#d9534f",
                          fontWeight: "bold",
                          marginTop: "10px",
                        }}
                      >
                        {selectedAssign?.vehicle?.license_plate ||
                          selectedAssign?.license_plate ||
                          "-"}
                      </div>
                      <div style={{ fontSize: "14px", color: "#ccc" }}>
                        {selectedAssign?.vehicle?.vehicle_name ||
                          selectedAssign?.vehicle_name ||
                          "Unknown"}
                      </div>
                    </div>
                    <div>
                      <Image
                        src="/placeholder-driver.png"
                        alt="driver"
                        width={80}
                        height={80}
                        style={{
                          borderRadius: "8px",
                          objectFit: "cover",
                          backgroundColor: "#000",
                        }}
                      />
                      <div
                        style={{
                          color: "#d9534f",
                          fontWeight: "bold",
                          marginTop: "10px",
                        }}
                      >
                        {selectedAssign?.driver?.driver_name ||
                          selectedAssign?.driver_name ||
                          "Unknown"}
                      </div>
                      <div style={{ fontSize: "14px", color: "#ccc" }}>
                        {selectedAssign?.driver?.phone ||
                          selectedAssign?.phone ||
                          "09-xxxxxxxxx"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Start Trips Assignment */}
                <div style={panelStyle}>
                  <h3 style={panelHeaderStyle}>
                    <span style={{ color: "#d9534f", marginRight: "8px" }}>
                      | 🛫
                    </span>{" "}
                    START TRIPS ASSIGNMENT
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      marginBottom: "15px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Start Time</label>
                      <input
                        type="datetime-local"
                        className={styles.selectBox}
                        style={inputStyle}
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Routes</label>
                      <select
                        className={styles.selectBox}
                        style={inputStyle}
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
                    <label style={labelStyle}>Trips Day (Daily Count)</label>
                    <input
                      type="number"
                      placeholder="0"
                      className={styles.selectBox}
                      style={{ ...inputStyle, width: "50%" }}
                      value={tripsDay}
                      onChange={(e) => setTripsDay(e.target.value)}
                    />
                  </div>
                </div>

                {/* Charging Info Assignment */}
                <div style={panelStyle}>
                  <h3 style={panelHeaderStyle}>
                    <span style={{ color: "#d9534f", marginRight: "8px" }}>
                      | 🔌
                    </span>{" "}
                    CHARGING INFO ASSIGNMENT
                  </h3>
                  <div style={{ display: "flex", gap: "15px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>KW</label>
                      <input
                        type="number"
                        placeholder="e.g. 123"
                        className={styles.selectBox}
                        style={inputStyle}
                        value={chargingKw}
                        onChange={(e) => setChargingKw(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Total Amount</label>
                      <input
                        type="number"
                        placeholder="Enter Amount"
                        className={styles.selectBox}
                        style={inputStyle}
                        value={chargingAmount}
                        onChange={(e) => setChargingAmount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {/* End Trips Assignment */}
                <div style={{ ...panelStyle, flex: 1 }}>
                  <h3 style={panelHeaderStyle}>
                    <span style={{ color: "#d9534f", marginRight: "8px" }}>
                      | 🛬
                    </span>{" "}
                    END TRIPS ASSIGNMENT
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      marginBottom: "15px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>End Times</label>
                      <input
                        type="datetime-local"
                        className={styles.selectBox}
                        style={inputStyle}
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>End Odo</label>
                      <input
                        type="number"
                        placeholder="e.g. 291922"
                        className={styles.selectBox}
                        style={inputStyle}
                        value={endOdo}
                        onChange={(e) => setEndOdo(e.target.value)}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={labelStyle}>End Battery</label>
                    <input
                      type="number"
                      placeholder="89"
                      className={styles.selectBox}
                      style={{ ...inputStyle, width: "50%" }}
                      value={endBattery}
                      onChange={(e) => setEndBattery(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Description</label>
                    <textarea
                      placeholder="Enter Description...."
                      className={styles.selectBox}
                      style={{
                        ...inputStyle,
                        height: "130px",
                        resize: "none",
                        paddingTop: "15px",
                      }}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* Overtime Assignment */}
                <div style={panelStyle}>
                  <h3 style={panelHeaderStyle}>
                    <span style={{ color: "#d9534f", marginRight: "8px" }}>
                      | ⏱️
                    </span>{" "}
                    OVERTIME ASSIGNMENT
                  </h3>
                  <div style={{ display: "flex", gap: "15px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Distance (KM)</label>
                      <input
                        type="text"
                        readOnly
                        className={styles.selectBox}
                        style={{
                          ...inputStyle,
                          backgroundColor: "#0a0a0a",
                          color: "#4cae4c",
                        }}
                        value={
                          overtimeDistance ? `${overtimeDistance} km` : "- km"
                        }
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Extra Time (Hours)</label>
                      <input
                        type="text"
                        readOnly
                        className={styles.selectBox}
                        style={{
                          ...inputStyle,
                          backgroundColor: "#0a0a0a",
                          color: "#4cae4c",
                        }}
                        value={extraTime ? `${extraTime} Hr` : "- Hr"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Modal */}
      {showRouteModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ marginBottom: 15, fontWeight: "bold" }}>
              Add New Route
            </h2>
            <input
              placeholder="Route Name"
              className={styles.selectBox}
              style={{ marginBottom: 10, width: "100%" }}
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
            />
            <input
              placeholder="Start Location"
              className={styles.selectBox}
              style={{ marginBottom: 10, width: "100%" }}
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
            />
            <input
              placeholder="End Location"
              className={styles.selectBox}
              style={{ marginBottom: 10, width: "100%" }}
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
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
                onClick={() => setShowRouteModal(false)}
              >
                Cancel
              </button>
              <button className={styles.btnPrimary} onClick={handleCreateRoute}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Price Modal */}
      {showTripPriceModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ marginBottom: 15, fontWeight: "bold" }}>
              Add Trip Price
            </h2>
            <select
              className={styles.selectBox}
              style={{ marginBottom: 10, width: "100%" }}
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
              style={{ marginBottom: 10, width: "100%" }}
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
              style={{ marginBottom: 10, width: "100%" }}
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
              style={{ marginBottom: 10, width: "100%" }}
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
            />
            <input
              placeholder="Overnight Trip Rate"
              type="number"
              className={styles.selectBox}
              style={{ width: "100%" }}
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
                onClick={() => setShowTripPriceModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handleCreateTripPrice}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= INLINE STYLES =================
const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};
const modalContentStyle: React.CSSProperties = {
  backgroundColor: "#1e1e1e",
  padding: 25,
  borderRadius: 8,
  width: 400,
  color: "#fff",
};

const largeModalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};
const largeModalContentStyle: React.CSSProperties = {
  backgroundColor: "#171717",
  padding: "30px",
  borderRadius: "12px",
  width: "1100px",
  maxWidth: "95vw",
  maxHeight: "95vh",
  overflowY: "auto",
  color: "#fff",
  border: "1px solid #333",
};
const panelStyle: React.CSSProperties = {
  backgroundColor: "#222",
  padding: "20px",
  borderRadius: "10px",
  border: "1px solid #333",
};
const panelHeaderStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#ccc",
  textTransform: "uppercase",
  marginBottom: "20px",
  marginTop: 0,
  letterSpacing: "1px",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#111",
  border: "1px solid #333",
  padding: "12px 15px",
  borderRadius: "8px",
  color: "#fff",
  outline: "none",
};
const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontSize: "13px",
  color: "#888",
};

const btnCancelStyle: React.CSSProperties = {
  backgroundColor: "#111",
  border: "1px solid #333",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};
const btnSaveOngoingStyle: React.CSSProperties = {
  backgroundColor: "#c9302c",
  border: "none",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};
const btnFinalizeStyle: React.CSSProperties = {
  backgroundColor: "#4cae4c",
  border: "none",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};
