import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiClient } from "../../features/lib/api-client";
import styles from "./rentalOpPage.module.css";

// Types များကို တိကျစွာ သတ်မှတ်ထားပါသည်
export interface Route {
  id: string;
  route_name: string;
}

export interface Station {
  id: string;
  station_name: string;
}

export interface VehicleModel {
  id?: string;
  vehicle_model_id?: string;
  vehicle_model_name: string;
}

interface Props {
  routesList: Route[];
  stationsList: Station[];
  vehicleModelsList: VehicleModel[];
  onClose: () => void;
  onSuccess?: () => void;
}

interface ModelPriceEntry {
  vehicle_model_id: string;
  vehicle_model_name: string;
  daily_price: string;
  overnight_price: string;
  isSelected: boolean;
}

export default function AddTripPriceModal({
  routesList,
  stationsList,
  vehicleModelsList,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedStationId, setSelectedStationId] = useState("");

  const [priceEntries, setPriceEntries] = useState<ModelPriceEntry[]>([]);

  useEffect(() => {
    const initialEntries = vehicleModelsList.map((model, index) => ({
      vehicle_model_id: model.id || model.vehicle_model_id || `vm-${index}`,
      vehicle_model_name: model.vehicle_model_name || "Unknown Model",
      daily_price: "",
      overnight_price: "",
      isSelected: false,
    }));
    setPriceEntries(initialEntries);
  }, [vehicleModelsList]);

  const handlePriceChange = (
    index: number,
    field: keyof ModelPriceEntry,
    value: string | boolean,
  ) => {
    const updatedEntries = [...priceEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };

    if (
      (field === "daily_price" || field === "overnight_price") &&
      value !== ""
    ) {
      updatedEntries[index].isSelected = true;
    }

    setPriceEntries(updatedEntries);
  };

  const handleSaveBulk = async () => {
    if (!selectedRouteId || !selectedStationId) {
      return toast.error("Route နှင့် Station ကို အရင်ရွေးချယ်ပါ။");
    }

    const validEntries = priceEntries.filter(
      (entry) =>
        entry.isSelected && (entry.daily_price || entry.overnight_price),
    );

    if (validEntries.length === 0) {
      return toast.error("အနည်းဆုံး ကားတစ်စီးအတွက် ဈေးနှုန်း သတ်မှတ်ပေးပါ။");
    }

    try {
      setLoading(true);
      toast.loading("ဈေးနှုန်းများ သိမ်းဆည်းနေပါသည်...", { id: "save-prices" });

      const bulkPayload = {
        route_id: selectedRouteId,
        station_id: selectedStationId,
        prices: validEntries.map((entry) => ({
          vehicle_model_id: entry.vehicle_model_id,
          daily_trip_rate: entry.daily_price || "0",
          overnight_trip_rate: entry.overnight_price || "0",
        })),
      };

      await apiClient.post("/master-trips/trip-prices/bulk", bulkPayload);

      toast.success("ဈေးနှုန်းများ အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ!", {
        id: "save-prices",
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("သိမ်းဆည်းရာတွင် အမှားအယွင်းရှိပါသည်", { id: "save-prices" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.largeModalOverlay}>
      <div className={`${styles.largeModalContent} ${styles.bulkModalContent}`}>
        <h2>Add Bulk Trip Prices</h2>

        <div className={styles.flexGap}>
          <div className={styles.flex1}>
            <label className={styles.inputLabel}>Select Route</label>
            <select
              className={styles.selectBox}
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
            >
              <option value="">-- ခရီးစဉ် ရွေးချယ်ရန် --</option>
              {routesList.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.route_name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.flex1}>
            <label className={styles.inputLabel}>Select Station</label>
            <select
              className={styles.selectBox}
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
            >
              <option value="">-- Station ရွေးချယ်ရန် --</option>
              {stationsList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.station_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.priceTable}>
            <thead>
              <tr className={styles.tableHeadRow}>
                <th className={styles.tableCell}>Include</th>
                <th className={styles.tableCell}>Vehicle Model</th>
                <th className={styles.tableCell}>Daily Price (MMK)</th>
                <th className={styles.tableCell}>Overnight Price (MMK)</th>
              </tr>
            </thead>
            <tbody>
              {priceEntries.map((entry, index) => (
                <tr
                  key={`price-row-${entry.vehicle_model_id}-${index}`}
                  className={styles.tableBodyRow}
                >
                  <td className={styles.tableCellCenter}>
                    <input
                      type="checkbox"
                      checked={entry.isSelected}
                      onChange={(e) =>
                        handlePriceChange(index, "isSelected", e.target.checked)
                      }
                      className={styles.checkboxInput}
                    />
                  </td>
                  <td className={styles.tableCellBold}>
                    {entry.vehicle_model_name}
                  </td>
                  <td className={styles.tableCell}>
                    <input
                      type="number"
                      placeholder="e.g 90000"
                      className={styles.selectBox}
                      value={entry.daily_price}
                      onChange={(e) =>
                        handlePriceChange(index, "daily_price", e.target.value)
                      }
                      disabled={!entry.isSelected}
                    />
                  </td>
                  <td className={styles.tableCell}>
                    <input
                      type="number"
                      placeholder="e.g 130000"
                      className={styles.selectBox}
                      value={entry.overnight_price}
                      onChange={(e) =>
                        handlePriceChange(
                          index,
                          "overnight_price",
                          e.target.value,
                        )
                      }
                      disabled={!entry.isSelected}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className={`${styles.actionButtonsCenter} ${styles.actionButtonsContainer}`}
        >
          <button
            className={styles.btnCancel}
            onClick={onClose}
            disabled={loading}
          >
            CANCEL
          </button>
          <button
            className={styles.btnSave}
            onClick={handleSaveBulk}
            disabled={loading}
          >
            {loading ? "Saving..." : "✔️ SAVE ALL PRICES"}
          </button>
        </div>
      </div>
    </div>
  );
}
