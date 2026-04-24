"use client";

import { SubmitHandler } from "react-hook-form";



export interface TripFormData {
    route_id: string;
    vehicle_model_id: string;
    station_id: string;
    daily_trip_rate: string;
    overnight_trip_rate: string;
    status?: string;
}


interface TripFormProps {
    mode:"create" | "update";
    initialData?:Partial<TripFormData>;
    onSubmit:SubmitHandler<TripFormData>;
    loading?:boolean;
    onClose:()=>void;
}

export const TripForm:React.FC<TripFormProps>=({
    
}) => {





}
