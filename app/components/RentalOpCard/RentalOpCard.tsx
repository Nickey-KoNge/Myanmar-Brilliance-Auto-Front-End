import React from "react";
import Image from "next/image";
import styles from "./RentalOpCard.module.css";

export interface RentalOperationData {
  id?: string;
  route_id?: string;
  vehicle_id?: string;
  driver_id?: string;
  station_id?: string;

  daily_count?: string | null;
  trip_status?: string;
  start_time?: string | Date | null;
  end_time?: string | Date | null;
  status?: string;
  created_at?: string | Date;

  // Relations & Flattened Fields
  route_name?: string | null;
  vehicle_name?: string | null;
  driver_name?: string | null;
  station_name?: string | null;
  plate_number?: string | null;
  branch_name?: string | null;
  vehicle_image_url?: string | null;
  driver_image_url?: string | null;

  // 🛑 Operation Details (True Information)
  start_odo?: string | null;
  start_battery?: string | null;
  end_odo?: string | null;
  extra_hours?: string | null;
  kw?: string | null;
  amount?: string | null;
  end_battery?: string | null;
  description?: string | null;
  power_station_name?: string | null;
}

interface RentalOpCardProps {
  data: RentalOperationData;
}

export const RentalOpCard: React.FC<RentalOpCardProps> = ({ data }) => {
  console.log("RentalOpCard Rendered with Data:", data); // Debugging log
  return (
    <div className={styles.card}>
      {/* Top Section */}
      <div className={styles.topSection}>
        {/* Vehicle & Driver */}
        <div className={styles.infoBox}>
          <div className={styles.actorWrap}>
            <div className={styles.actorCard}>
              <Image
                src={data?.vehicle_image_url || "/placeholder-car.png"}
                alt="car"
                width={50}
                height={50}
                unoptimized
                className={styles.actorImage}
              />
              <span className={styles.actorName}>
                {data?.vehicle_name || "-"}
              </span>
              <span className={styles.actorSub}>
                {data?.plate_number || "-"}
              </span>
            </div>

            <div className={styles.actorCard}>
              <Image
                src={data?.driver_image_url || "/placeholder-driver.png"}
                alt="driver"
                width={50}
                height={50}
                unoptimized
                className={styles.actorImage}
              />
              <span className={styles.actorName}>
                {data?.driver_name || "-"}
              </span>
              <span className={styles.actorSub}>
                SR : {data?.driver_id ? data.driver_id.slice(0, 4) : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Route Info */}
        <div className={styles.infoBox}>
          <div className={styles.row}>
            <span className={styles.label}>Branch Name :</span>
            <span className={styles.value}>{data?.branch_name || "-"}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Station Name :</span>
            <span className={styles.value}>{data?.station_name || "-"}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Status :</span>
            <span className={`${styles.value} ${styles.textYellow}`}>
              {data?.trip_status || "No Trip"}
            </span>
          </div>
        </div>

        {/* Battery & Odo */}
        <div className={styles.infoBox}>
          <div className={styles.row}>
            <span className={styles.label}>Start Odo :</span>
            <span className={styles.value}>
              {data?.start_odo && data.start_odo !== "-"
                ? `${data.start_odo} KM`
                : "-"}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Battery :</span>
            <span className={`${styles.value} ${styles.textGreen}`}>
              {data?.start_battery && data.start_battery !== "-"
                ? `${data.start_battery}%`
                : "-"}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Starting Time :</span>
            <span className={`${styles.value} ${styles.textGreen}`}>
              {data?.start_time && data.start_time !== "-"
                ? new Date(data.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </span>
          </div>
        </div>
        <div className={styles.infoBox}>
          <div className={styles.row}>
            <span className={styles.label}>Receive Date :</span>
            <span className={styles.value}>
              {data?.start_odo && data.start_odo !== "-"
                ? `${data.start_odo} KM`
                : "-"}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Payment :</span>
            <span className={`${styles.value} ${styles.textGreen}`}>
              {data?.start_battery && data.start_battery !== "-"
                ? `${data.start_battery}%`
                : "-"}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>In-charge Person ::</span>
            <span className={`${styles.value} ${styles.textGreen}`}>
              {data?.start_time && data.start_time !== "-"
                ? new Date(data.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </span>
          </div>
        </div>

        {/* Finance */}
        <div className={styles.financeBox}>
          <div className={styles.row}>
            <span className={styles.label}>Rental :</span>
            <span className={styles.value}>
              {data?.amount && data.amount !== "-" ? `${data.amount} MMK` : "-"}
            </span>
          </div>
          <div className={`${styles.row} ${styles.totalRow}`}>
            <span className={styles.textGreen}>Over Time :</span>
            <span className={styles.textGreen}>
              {data?.amount && data.amount !== "-" ? `${data.amount} MMK` : "-"}
            </span>
          </div>
          <div className={`${styles.row} ${styles.totalRow}`}>
            <span className={styles.textGreen}>Refund :</span>
            <span className={styles.textGreen}>
              {data?.amount && data.amount !== "-" ? `${data.amount} MMK` : "-"}
            </span>
          </div>
          <hr></hr>
          <div className={`${styles.row} ${styles.totalRow}`}>
            <span className={styles.textGreen}>Total :</span>
            <span className={styles.textGreen}>
              {data?.amount && data.amount !== "-" ? `${data.amount} MMK` : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        <div className={styles.subCard}>
          <div className={styles.subCardHeader}>Departure</div>
          <div className={styles.row}>
            <span className={styles.label}>Start Time :</span>
            <span className={styles.textGreen}>
              {data?.start_time && data.start_time !== "-"
                ? new Date(data.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Record :</span>
            <span className={styles.textGreen}>Daily</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Trips Day :</span>
            <span className={styles.textGreen}>{data?.daily_count || "-"}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Route :</span>
            <span className={styles.textGreen}>{data?.route_name || "-"}</span>
          </div>{" "}
        </div>

        <div className={styles.subCard}>
          <div className={styles.subCardHeader}>Arrival</div>
          <div className={styles.row}>
            <span>Return Time:</span>{" "}
            <span className={styles.textGreen}>
              {data.end_time
                ? new Date(data.end_time).toLocaleTimeString()
                : "-"}
            </span>
          </div>
          <div className={styles.row}>
            <span>Return Odo:</span> <span>{data.end_odo} KM</span>
          </div>
          <div className={styles.row}>
            <span>Return Battery:</span> <span>{data.end_battery}%</span>
          </div>
          <div className={styles.row}>
            <span>Remark:</span>{" "}
            <span className={styles.textYellow}>{data.description}</span>
          </div>
        </div>
        <div className={styles.subCard}>
          <div className={styles.subCardHeader}>Overtime Info</div>
          <div className={styles.row}>
            <span className={styles.label}>Extra Time :</span>
            <span className={styles.value}>
              {data?.extra_hours && data.extra_hours !== "-"
                ? `${data.extra_hours} Hr`
                : "-"}
            </span>
          </div>
        </div>
        <div className={styles.subCard}>
          <div className={styles.subCardHeader}>Charging Info</div>
          <div className={styles.row}>
            <span>Station:</span> <span>{data.power_station_name}</span>
          </div>
          <div className={styles.row}>
            <span>KW:</span> <span>{data.kw} KW</span>
          </div>
          <div className={styles.row}>
            <span>Cost:</span> <span>{data.amount} MMK</span>
          </div>
        </div>
        <div className={styles.subCard}>
          <div className={styles.subCardHeader}>Overtime Info</div>
          <div className={styles.row}>
            <span>Extra Time:</span>{" "}
            <span className={styles.textYellow}>
              {data.extra_hours ? `${data.extra_hours}` : "0 Hr"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
