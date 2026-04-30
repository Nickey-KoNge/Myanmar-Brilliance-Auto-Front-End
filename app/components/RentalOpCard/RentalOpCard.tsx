"use client";

import styles from "./RentalOpCard.module.css";
import Image from "next/image";

export interface RentalOperationData {
  id: string | number;
  vehicle_name: string;
  plate_number: string;
  city_taxi_no: string;
  driver_name: string;
  phone: string;
  driver_nrc: string;
  vehicle_image_url: string | null;
  driver_image_url: string | null;
  station_name: string;
  branch_name: string;
  // Backend က တိုက်ရိုက်ပို့ရင် သုံးရန်
  route_name?: string;

  // Backend က Object နဲ့ပို့ရင် သုံးရန်
  route?: {
    route_name: string;
  };
  default_route_name?: string;
  trip_status: string;
  daily_count: string;
  overnight_count?: string;
  start_time: string | null;
  end_time: string | null;
  start_odo: string | number;
  end_odo: string | number;
  start_battery: string;
  end_battery: string;
  extra_hours: string;
  kw: string;
  power_station_name: string;
  amount: string;
  rental_amount: string;
  overtime_amount: string;
  refund_amount: string;
  total_amount: string;

  route_id?: string;
  vehicle_id?: string;
  driver_id?: string;
  station_id?: string;

  status?: string;
  created_at?: string | Date;
}

interface RentalOpCardProps {
  data: RentalOperationData;
  onOpenStartModal: () => void;
  onOpenEndModal: () => void;
}
const formatTime = (timeString: string | null) => {
  if (!timeString) return "-";
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return timeString;
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function RentalOpCard({
  data,
  onOpenStartModal,
  onOpenEndModal,
}: RentalOpCardProps) {
  // ဤနေရာတွင် default_route_name ကိုပါ ထည့်သွင်းစဉ်းစားပါမည်
  const actualRouteName =
    data?.route_name ||
    data?.route?.route_name ||
    data?.default_route_name || // <--- Operation မရှိရင် Default Route ကို ယူပြမည်
    "";

  const isValidRoute = actualRouteName !== "" && actualRouteName !== "-";

  const isCityTrip =
    actualRouteName.toLowerCase().includes("city") ||
    actualRouteName.includes("မြို့တွင်း");

  const tripTypeLabel = isValidRoute
    ? isCityTrip
      ? "(မြို့တွင်း)"
      : "(နယ်ဝေး)"
    : "";
  return (
    <div className={styles.singleRowCard}>
      {/* 1. Actors (Vehicle & Driver) - Color 1 */}
      <div className={styles.cellActors}>
        <div className={styles.actorMini}>
          {/* Vehicle Card */}
          <div className={styles.actorCard}>
            <Image
              src={data?.vehicle_image_url || "/placeholder-car.png"}
              alt="car"
              width={60}
              height={60}
              unoptimized
              className={styles.actorImage}
            />
            <div className={styles.actorText}>
              <span className={styles.bold}>
                {data?.vehicle_name || "-"}{" "}
                <span
                  style={{
                    color: isCityTrip ? "#10b981" : "#f59e0b",
                    fontSize: "0.85em",
                  }}
                >
                  {tripTypeLabel}
                </span>
              </span>

              {/* Plate ကို တစ်တန်းတည်းဖြစ်အောင် div ဖြင့်ထုပ်ခြင်း */}
              <div className={styles.textLine}>
                <span className={styles.textLabel}>Plate :</span>
                <span className={styles.muted}>
                  {data?.plate_number || "-"}
                </span>
              </div>

              {/* City Taxi ကို တစ်တန်းတည်းဖြစ်အောင် div ဖြင့်ထုပ်ခြင်း */}
              <div className={styles.textLine}>
                <span className={styles.textLabel}>City Taxi :</span>
                <span className={styles.muted}>
                  {data?.city_taxi_no || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Driver Card */}
          <div className={styles.actorCard}>
            <Image
              src={data?.driver_image_url || "/placeholder-driver.png"}
              alt="driver"
              width={60}
              height={60}
              unoptimized
              className={styles.actorImage}
            />
            <div className={styles.actorText}>
              <span className={styles.bold}>{data?.driver_name || "-"}</span>

              <div className={styles.textLine}>
                <span className={styles.textLabel}>Phone :</span>
                <span className={styles.muted}>
                  {data?.phone ? data?.phone : "-"}
                </span>
              </div>

              <div className={styles.textLine}>
                <span className={styles.textLabel}>NRC :</span>
                <span className={styles.muted}>
                  {data.driver_nrc ? data?.driver_nrc : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Route & Location Info - Color 2 */}
      <div className={`${styles.cell} ${styles.cellLocation}`}>
        <div className={styles.cellTitle}>Station & Route</div>
        <div className={styles.row}>
          <span className={styles.textLabel}>Branch :</span>{" "}
          <strong>{data?.branch_name || "-"}</strong>
        </div>
        <div className={styles.row}>
          <span className={styles.textLabel}>Station :</span>{" "}
          <strong>{data?.station_name || "-"}</strong>
        </div>
        <div className={styles.row}>
          <span className={styles.textLabel}>Route :</span>{" "}
          <strong className={styles.textgreen}>
            {data?.route_name || "-"}
          </strong>
        </div>
      </div>

      {/* 3. Status & General - Color 3 */}
      <div className={`${styles.cell} ${styles.cellStatus}`}>
        <div className={styles.cellTitle}>Current Status</div>
        <div className={styles.row}>
          <span className={styles.textLabel}>Status :</span>{" "}
          <span className={styles.textYellow}>
            {data?.trip_status || "No Trip"}
          </span>
        </div>

        {/* 💡 ဒီနေရာလေးကို ပြင်ဆင်လိုက်ပါသည် */}
        <div className={styles.row}>
          <span className={styles.textLabel}>
            {isCityTrip ? "Daily Trips :" : "Overnight :"}
          </span>{" "}
          <strong>
            {isCityTrip
              ? data?.daily_count || "-"
              : data?.overnight_count || "-"}
          </strong>
        </div>

        <div className={styles.row}>
          <span className={styles.textLabel}>Record :</span>{" "}
          <strong>{isCityTrip ? "Daily" : "Overnight"}</strong>
        </div>
      </div>

      {/* 4. Departure Info - Color 4 */}
      <div
        className={`${styles.cell} ${styles.cellDeparture}`}
        onClick={onOpenStartModal}
        style={{ cursor: "pointer" }}
      >
        <div className={styles.cellTitle}>Departure</div>
        <div className={styles.row}>
          <span className={styles.textLabel}>Time :</span>{" "}
          <span className={styles.textGreen}>
            {formatTime(data?.start_time)}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.textLabel}>Odo :</span>{" "}
          <span>{data?.start_odo ? `${data.start_odo} KM` : "-"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.textLabel}>Battery :</span>{" "}
          <span className={styles.textGreen}>
            {data?.start_battery ? `${data.start_battery} %` : "-"}
          </span>
        </div>
      </div>

      {/* 5. Arrival Info - Color 5 */}
      <div
        className={`${styles.cell} ${styles.cellArrival}`}
        onClick={onOpenEndModal}
        style={{ cursor: "pointer" }}
      >
        <div className={styles.cellTitle}>Arrival</div>
        <div className={styles.row}>
          <span className={styles.textLabel}>Time :</span>{" "}
          <span className={styles.textGreen}>{formatTime(data?.end_time)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.textLabel}>Odo :</span>{" "}
          <span>{data?.end_odo ? `${data.end_odo} KM` : "-"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.textLabel}>Battery :</span>{" "}
          <span className={styles.textYellow}>
            {data?.end_battery ? `${data.end_battery} %` : "-"}
          </span>
        </div>
      </div>

      {/* 6. Overtime & Charging - Color 6 */}
      <div className={`${styles.cell} ${styles.cellExtra}`}>
        <div className={styles.cellTitle}>OverTime</div>
        <div className={styles.row}>
          <span className={styles.textLabel}>OT Hours :</span>{" "}
          <span className={styles.textYellow}>
            {data?.extra_hours ? `${data.extra_hours} ` : "0 Hr"}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.textLabel}>Station :</span>{" "}
          <span>{data?.power_station_name || "-"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.textLabel}>Charged :</span>{" "}
          <span>{data?.kw ? `${data.kw} KW` : "-"}</span>
        </div>
      </div>

      {/* 7. Finance - Color 7 */}
      <div className={`${styles.cell} ${styles.cellFinance}`}>
        <div className={styles.row}>
          <span className={styles.textLabel}>Rental :</span>{" "}
          <span>
            {data?.rental_amount ? `${data.rental_amount} MMK` : "0 MMK"}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.textLabel}>OT Cost:</span>{" "}
          <span>
            {data?.overtime_amount ? `${data.overtime_amount} MMK` : "0 MMK"}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.textLabel}>Return Cost :</span>{" "}
          <span className={styles.refundAmount}>
            {data?.refund_amount ? `${data.refund_amount} MMK` : "0 MMK"}
          </span>
        </div>
        <hr className={styles.cuttingLine} />
        <div className={styles.row}>
          <span className={styles.textLabel}>Total :</span>{" "}
          <span className={styles.textGreen}>
            {data?.total_amount ? `${data.total_amount} MMK` : "0 MMK"}
          </span>
        </div>
      </div>
    </div>
  );
}
