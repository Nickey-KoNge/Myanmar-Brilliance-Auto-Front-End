"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import styles from "./rentalOpPage.module.css";
import {
  RentalOpCard,
  RentalOperationData,
} from "../../components/RentalOpCard/RentalOpCard";
import { apiClient } from "../../features/lib/api-client";
import { ActiveOp, Route, Station, VehicleAssign, VehicleModel } from "./types";
import { getInitialVehicleOdo } from "./utils";
import AddRouteModal from "./AddRouteModal";
import AddTripPriceModal from "./AddTripPriceModal";
import OpEntryModal from "./OpEntryModal";

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

  const [showOpEntryModal, setShowOpEntryModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showTripPriceModal, setShowTripPriceModal] = useState(false);
  const [selectedAssign, setSelectedAssign] = useState<VehicleAssign | null>(
    null,
  );

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
      const today = new Date().toISOString().split("T")[0];

      const [assignRes, opRes] = await Promise.all([
        apiClient.get(
          `/master-vehicle/vehicle-driver-assign?station_id=${stationId}&status=Ongoing`,
        ),
        apiClient.get(
          `/master-rental/rental-operation?station_id=${stationId}&startDate=${today}`,
        ),
      ]);

      // ၁။ Assign Data ကို Extract လုပ်ခြင်း
      let assignData: VehicleAssign[] = [];
      if (assignRes) {
        if (Array.isArray(assignRes)) {
          assignData = assignRes as VehicleAssign[];
        } else {
          // 💡 unknown အဖြစ်အရင်ပြောင်းပြီးမှ Record အဖြစ် Cast လုပ်ပါ
          const resObj = assignRes as unknown as Record<string, unknown>;
          const rawItems = (resObj.items || resObj.data || resObj) as unknown;
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

      // ၂။ Operation Data ကို Extract လုပ်ခြင်း
      let opData: ActiveOp[] = [];
      if (opRes) {
        if (Array.isArray(opRes)) {
          opData = opRes as ActiveOp[];
        } else {
          // 💡 unknown အဖြစ်အရင်ပြောင်းပြီးမှ Record အဖြစ် Cast လုပ်ပါ
          const resObj = opRes as unknown as Record<string, unknown>;
          const rawOps = (resObj.items || resObj.data || resObj) as unknown;
          if (Array.isArray(rawOps)) {
            opData = rawOps as ActiveOp[];
          }
        }
      }

      setAssignList(uniqueAssignData);
      setActiveOperations(opData);
    } catch (err) {
      console.error("Fetch Assign Error:", err);
      toast.error("Failed to load operations.");
    } finally {
      setFetching(false);
    }
  };

  const openOpEntryModal = (assign: VehicleAssign) => {
    setSelectedAssign(assign);
    setShowOpEntryModal(true);
  };

  const handleModalSuccess = () => {
    setShowOpEntryModal(false);
    fetchAssignmentsByStation(selectedStationId);
  };

  const mapToCardData = (assign: VehicleAssign): RentalOperationData => {
    const vId = assign.vehicle?.id || assign.vehicle_id;

    // 💡 ဒီ Vehicle အတွက် ရှိသမျှ operation တွေကို ရှာပြီး ID ကြီးတာ (သို့) အသစ်ဆုံးကို ယူပါမယ်
    const vehicleOps = activeOperations.filter(
      (op) => String(op.vehicle?.id || op.vehicle_id) === String(vId),
    );

    // အသစ်ဆုံး operation ကို ယူခြင်း
    const activeOp =
      vehicleOps.length > 0
        ? vehicleOps.sort(
            (a, b) =>
              new Date(b.created_at || 0).getTime() -
              new Date(a.created_at || 0).getTime(),
          )[0]
        : null;

    const initialOdo = getInitialVehicleOdo(assign);

    return {
      id: assign.id,
      vehicle_name:
        assign.vehicle?.vehicle_name || assign.vehicle_name || "Unknown",
      plate_number:
        assign.vehicle?.license_plate || assign.license_plate || "-",
      city_taxi_no:
       assign.city_taxi_no || "Unknown",
      phone: assign.driver?.phone || assign.phone || "Unknown",
      driver_name:
        assign.driver?.driver_name || assign.driver_name || "Unknown",
      driver_id: assign.driver?.id || assign.driver_id || "-",
      station_name:
        assign.station?.station_name || assign.station_name || "Unknown",
      branch_name: activeOp?.branch_name || assign.station?.branch_name || "-",

      // Status: Pending, Ongoing, Completed ၃ ခုလုံး ဒီမှာ ပါလာပါလိမ့်မယ်
      trip_status: activeOp?.trip_status || "No Trip",
      start_time: activeOp?.start_time || null,
      end_time: activeOp?.end_time || null,

      route_name: activeOp?.route?.route_name || activeOp?.route_name || "-",
      daily_count: activeOp?.daily_count || "-",

      start_odo: activeOp?.start_odo || initialOdo,
      end_odo: activeOp?.end_odo || "-",
      start_battery: activeOp?.start_battery || "-",
      end_battery: activeOp?.end_battery || "-",

      extra_hours: activeOp?.extra_hours || "-",
      description: activeOp?.description || "-",

      // Charging Info
      kw: activeOp?.kw || "-",
      amount: activeOp?.amount || "-",
      power_station_name: activeOp?.power_station_name || "-",

      vehicle_image_url:
        activeOp?.vehicle_image || assign.vehicle_image || null,
      driver_image_url: activeOp?.driver_image || assign.driver_image || null,
    };
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

      {showOpEntryModal && selectedAssign && (
        <OpEntryModal
          assign={selectedAssign}
          routesList={routesList}
          selectedStationId={selectedStationId}
          onClose={() => setShowOpEntryModal(false)}
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
