export interface Station {
  id: string;
  station_name: string;
}

export interface Route {
  id: string;
  route_name: string;
}

export interface VehicleModel {
  id: string;
  vehicle_model_name: string;
}

export interface VehicleAssign {
  id: string;
  vehicle_id?: string;
  driver_id?: string;
  driver_nrc?: string;
  vehicle?: {
    id: string;
    vehicle_name: string;
    license_plate?: string;
    current_odometer?: string;
  };
  driver?: {
    id: string;
    driver_name: string;
    phone?: string;
    address?: string;
    driver_nrc?: string;
  };
  station?: { id: string; station_name: string; branch_name?: string };
  vehicle_name?: string;
  license_plate?: string;
  driver_name?: string;
  phone?: string;
  station_name?: string;
  branch_name?: string;
  vehicle_image?: string;
  driver_image?: string;
  city_taxi_no: string;
}

export interface ActiveOp {
  id: string;
  vehicle_id?: string;
  route_id?: string;

  // Backend Serialize က လာမယ့် Flattened fields များ
  route_name?: string;
  vehicle_name?: string;
  plate_number?: string;
  driver_name?: string;
  phone?: string;
  driver_nrc?: string;
  station_name?: string;
  branch_name?: string;
  vehicle_image_url?: string;
  driver_image_url?: string;

  start_time?: string | Date | null;
  end_time?: string | Date | null;
  trip_status?: string;
  start_odo?: string;
  start_battery?: string;
  end_odo?: string;
  end_battery?: string;
  extra_hours?: string;
  kw?: string;
  amount?: string;
  daily_count?: string;
  overnight_count?: string;
  power_station_name?: string;
  description?: string;
  created_at?: string | Date | null;

  // Finance data (တကယ်လို့ total တွက်ချင်ရင်)
  trip_finances?: {
    rental_amount: string;
    overtime_amount: string;
    refund_amount: string;
    total: string;
  }[];
}
