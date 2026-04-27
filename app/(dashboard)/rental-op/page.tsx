"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import styles from "./rentalOpPage.module.css";

import RentalOpCard, {
  RentalOperationData,
} from "../../components/RentalOpCard/RentalOpCard";

import { apiClient } from "../../features/lib/api-client";
import { ActiveOp, Route, Station, VehicleAssign, VehicleModel } from "./types";
import { getInitialVehicleOdo } from "./utils";
import AddRouteModal from "./AddRouteModal";
import AddTripPriceModal from "./AddTripPriceModal";
import StartOpModal from "./StartOpModal";
import EndOpModal from "./EndOpModal";

export default function RentalOperationPage() {
  const [fetching, setFetching] = useState(false);

  const [stationsList, setStationsList] = useState<Station[]>([]);
  const [routesList, setRoutesList] = useState<Route[]>([]);
  const [vehicleModelsList, setVehicleModelsList] = useState<VehicleModel[]>(
    [],
  );

  const [selectedStationId, setSelectedStationId] = useState("");
  const [assignList, setAssignList] = useState<VehicleAssign[]>([]);
  const [activeOperations, setActiveOperations] = useState<ActiveOp[]>([]);

  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showTripPriceModal, setShowTripPriceModal] = useState(false);

  const [selectedAssign, setSelectedAssign] = useState<VehicleAssign | null>(
    null,
  );

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (selectedStationId) {
      fetchAssignmentsByStation(selectedStationId, false);

      intervalId = setInterval(() => {
        fetchAssignmentsByStation(selectedStationId, true);
      }, 3600000);
    } else {
      setAssignList([]);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedStationId]);

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
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.items)) return obj.items as T[];
        if (Array.isArray(obj.data)) return obj.data as T[];
        return [];
      };

      setStationsList(extractData<Station>(stationsRes));
      setRoutesList(extractData<Route>(routesRes));
      setVehicleModelsList(extractData<VehicleModel>(modelsRes));
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
    }
  };

  const fetchAssignmentsByStation = async (
    stationId: string,
    isBackground = false,
  ) => {
    try {
      if (!isBackground) setFetching(true);

      const [assignRes, opRes] = await Promise.all([
        apiClient.get(
          `/master-vehicle/vehicle-driver-assign?station_id=${stationId}&status=Ongoing`,
        ),
        apiClient.get(
          `/master-rental/rental-operation?station_id=${stationId}&limit=1000`,
        ),
      ]);

      let assignData: VehicleAssign[] = [];
      if (assignRes) {
        if (Array.isArray(assignRes)) {
          assignData = assignRes as VehicleAssign[];
        } else {
          const resObj = assignRes as unknown as Record<string, unknown>;
          const rawItems = resObj.items || resObj.data || resObj;
          if (Array.isArray(rawItems)) {
            assignData = rawItems as VehicleAssign[];
          }
        }
      }

      const uniqueAssignData = Array.from(
        new Map(
          assignData.map((item) => [
            item.vehicle?.id || item.vehicle_id || item.id,
            item,
          ]),
        ).values(),
      );

      let opData: ActiveOp[] = [];
      if (opRes) {
        if (Array.isArray(opRes)) {
          opData = opRes as ActiveOp[];
        } else {
          const resObj = opRes as unknown as Record<string, unknown>;
          const rawOps = resObj.items || resObj.data || resObj;
          if (Array.isArray(rawOps)) {
            opData = rawOps as ActiveOp[];
          }
        }
      }

      setAssignList(uniqueAssignData);
      setActiveOperations(opData);
    } catch (err) {
      console.error("Fetch Assign Error:", err);
      if (!isBackground) toast.error("Failed to load operations.");
    } finally {
      if (!isBackground) setFetching(false);
    }
  };

  const mapToCardData = (assign: VehicleAssign): RentalOperationData => {
    const vId = String(assign.vehicle?.id || assign.vehicle_id);
    const dId = String(assign.driver?.id || assign.driver_id);

    const vehicleOps = activeOperations.filter((op) => {
      const opData = op as unknown as {
        vehicle_id?: string | number;
        vehicle?: { id: string | number };
        driver_id?: string | number;
        driver?: { id: string | number };
      };

      const opVehicleId = String(opData.vehicle_id || opData.vehicle?.id);
      const opDriverId = String(opData.driver_id || opData.driver?.id);

      return opVehicleId === vId && opDriverId === dId;
    });

    const activeOp =
      vehicleOps.length > 0
        ? vehicleOps.sort((a, b) => {
            const opA = a as unknown as {
              status?: string;
              updated_at?: string;
            };
            const opB = b as unknown as {
              status?: string;
              updated_at?: string;
            };

            const aActive = opA.status === "Active" ? 1 : 0;
            const bActive = opB.status === "Active" ? 1 : 0;
            if (aActive !== bActive) {
              return bActive - aActive;
            }

            const timeA = new Date(
              opA.updated_at || a.start_time || a.created_at || 0,
            ).getTime();
            const timeB = new Date(
              opB.updated_at || b.start_time || b.created_at || 0,
            ).getTime();

            return timeB - timeA;
          })[0]
        : null;

    const initialOdo = getInitialVehicleOdo(assign);
    const financeRecord = activeOp?.trip_finances?.[0];

    const formatTimeToString = (
      time: string | Date | null | undefined,
    ): string | null => {
      if (!time) return null;
      return time instanceof Date ? time.toISOString() : String(time);
    };

    const opSafe = activeOp as unknown as {
      vehicle_image?: string;
      driver_image?: string;
      driver_nrc?: string;
      route?: { route_name?: string };
      status?: string;
      rental_amount?: string;
      overtime_amount?: string;
      refund_amount?: string;
      total_amount?: string;
      battery?: string | number;
      start_battery?: string | number;
    };

    const startBatteryValue =
      activeOp?.start_battery ??
      opSafe?.start_battery ??
      opSafe?.battery ??
      "-";

    return {
      id: assign.id || "-",
      vehicle_name:
        activeOp?.vehicle_name ||
        assign.vehicle?.vehicle_name ||
        assign.vehicle_name ||
        "-",
      plate_number:
        activeOp?.plate_number ||
        assign.vehicle?.license_plate ||
        assign.license_plate ||
        "-",
      city_taxi_no: assign.city_taxi_no || "-",
      driver_name:
        activeOp?.driver_name ||
        assign.driver?.driver_name ||
        assign.driver_name ||
        "-",
      phone: activeOp?.phone || assign.phone || assign.driver?.phone || "-",
      driver_nrc:
        opSafe?.driver_nrc ||
        assign.driver?.driver_nrc ||
        assign.driver_nrc ||
        "-",
      vehicle_image_url:
        activeOp?.vehicle_image_url ||
        opSafe?.vehicle_image ||
        assign.vehicle_image ||
        null,
      driver_image_url:
        activeOp?.driver_image_url ||
        opSafe?.driver_image ||
        assign.driver_image ||
        null,
      station_name:
        activeOp?.station_name ||
        assign.station?.station_name ||
        assign.station_name ||
        "-",
      branch_name:
        activeOp?.branch_name ||
        assign.station?.branch_name ||
        assign.branch_name ||
        "-",
      route_name: activeOp?.route_name || opSafe?.route?.route_name || "-",
      trip_status: activeOp?.trip_status || opSafe?.status || "No Trip",
      daily_count: activeOp?.daily_count || "0",
      start_time: formatTimeToString(activeOp?.start_time),
      end_time: formatTimeToString(activeOp?.end_time),
      start_odo: activeOp?.start_odo || initialOdo,
      end_odo: activeOp?.end_odo || "-",
      start_battery: String(startBatteryValue),
      end_battery: activeOp?.end_battery || "-",
      extra_hours: activeOp?.extra_hours || "0",
      kw: activeOp?.kw || "-",
      power_station_name: activeOp?.power_station_name || "-",
      amount: activeOp?.amount || "0",
      rental_amount:
        financeRecord?.rental_amount || opSafe?.rental_amount || "0",
      overtime_amount:
        financeRecord?.overtime_amount || opSafe?.overtime_amount || "0",
      refund_amount:
        financeRecord?.refund_amount || opSafe?.refund_amount || "0",
      total_amount: financeRecord?.total || opSafe?.total_amount || "0",
    };
  };

  const handleOpenStartModal = (assign: VehicleAssign) => {
    setSelectedAssign(assign);
    setShowStartModal(true);
  };

  const handleOpenEndModal = (assign: VehicleAssign) => {
    setSelectedAssign(assign);
    setShowEndModal(true);
  };

  const handleModalSuccess = () => {
    setShowStartModal(false);
    setShowEndModal(false);
    // UI ချက်ချင်းပြောင်းရန်အတွက် Background = false ဖြင့် တစ်ခေါက်ဆွဲမည်
    fetchAssignmentsByStation(selectedStationId, false);
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
          <div className={styles.cardState}>
            {assignList.map((assign, index) => (
              <div key={assign.id || index}>
                <RentalOpCard
                  data={mapToCardData(assign)}
                  onOpenStartModal={() => handleOpenStartModal(assign)}
                  onOpenEndModal={() => handleOpenEndModal(assign)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {showStartModal && selectedAssign && (
        <StartOpModal
          assign={selectedAssign}
          routesList={routesList}
          selectedStationId={selectedStationId}
          onClose={() => setShowStartModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showEndModal && selectedAssign && (
        <EndOpModal
          assign={selectedAssign}
          routesList={routesList}
          selectedStationId={selectedStationId}
          onClose={() => setShowEndModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showRouteModal && (
        <AddRouteModal
          onClose={() => setShowRouteModal(false)}
          onSuccess={fetchDropdownData}
        />
      )}
      {showTripPriceModal && (
        <AddTripPriceModal
          routesList={routesList}
          stationsList={stationsList}
          vehicleModelsList={vehicleModelsList}
          onClose={() => setShowTripPriceModal(false)}
        />
      )}
    </div>
  );
}
