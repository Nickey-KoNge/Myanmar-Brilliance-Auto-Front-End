"use client";

import { FormCard } from "@/app/components/ui/FormCard/FormCard";
import { Input } from "@/app/components/ui/Input/Input";
import DropdownInput from "@/app/components/ui/Inputs/DropdownInput";
import { apiClient } from "@/app/features/lib/api-client";
import { faMap } from "@fortawesome/free-solid-svg-icons";
import { register } from "module";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";



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

interface RouteOption {
    id:string;
    route_name:string;
}

interface VehicleModelOption {
    id:string;
    vehicle_model_name:string;
}




export const TripForm:React.FC<TripFormProps>=({
      mode,
  initialData,
  onSubmit,
  loading=false,
  onClose,
    
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState:{errors},
    }=useForm<TripFormData>({
        mode:"onTouched",
        defaultValues:initialData || {},
    });
    const [routes, setRoutes] = useState<RouteOption[]>([]);
    const [vehicleModels, setVehicleModels] = useState<VehicleModelOption[]>([]);

    // fatch route,vehicle model 
    const fetchOptions=async()=>{
        try {
            const [routesResponse, vehicleModelsResponse] = await Promise.all([
               apiClient.get("/master-trips/routes"),
               apiClient.get("/master-vehicle/vehicle-models"),
            ]);
            setRoutes(routesResponse.data);
            setVehicleModels(vehicleModelsResponse.data);

        
        }
            catch (error) {
                console.error("Error fetching options:", error);
            }
    };





    return(

        <form id="routeForm">

            <FormCard title="TRIP ASSIGNMENT" icon={faMap}>
                <div>
                    <div>
                        <DropdownInput
                        label="Route"
                        placeholder="Select Route"
                        options={routes.map(route=>({id:route.id,name:route.route_name}))}
                        {...register("route_id",{required:"Route is required"})}
                        error={errors.route_id?.message}
                        onFocus={fetchOptions}
                        />


                        <DropdownInput
                            label="Vehicle Model"
                            placeholder="Select Vehicle Model"
                            options={vehicleModels.map(model => ({ id: model.id, name: model.vehicle_model_name }))}
                            {...register("vehicle_model_id", { required: "Vehicle Model is required" })}
                            error={errors.vehicle_model_id?.message}
                        />

                    </div>


                    <div>

                        <Input
                            label="Daily Trip Rate"
                            placeholder="Enter Daily Trip Rate"
                            {...register("daily_trip_rate", { required: "Daily Trip Rate is required" })}
                            error={errors.daily_trip_rate?.message}
                        />


                        <Input
                            label="Overnight Trip Rate"
                            placeholder="Enter Overnight Trip Rate"
                            {...register("overnight_trip_rate", { required: "Overnight Trip Rate is required" })}
                            error={errors.overnight_trip_rate?.message}
                        />

                     
                       
                    </div>



                </div>

            </FormCard>

        </form>





    )









}
