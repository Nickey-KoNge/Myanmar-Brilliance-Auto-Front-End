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
  vehicle_image?: string; 
  driver_image?: string;
  city_taxi_no:string;
}

export interface ActiveOp {
  id: string;
  vehicle_id?: string;
  vehicle?: { id: string };
  route_id?: string;
  start_time?: string | Date | null;
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
  daily_count?: string;
  overnight_count?: string;
  power_station_name?: string;
  vehicle_image?: string;
  driver_image?: string;
  end_time?: string | Date | null;
  end_battery?: string;
  description?: string;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
  city_taxi_no?: string | null;
}
