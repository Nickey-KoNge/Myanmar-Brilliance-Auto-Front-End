"use client";

import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import { FormCard } from "@/app/components/ui/FormCard/FormCard";
import { Input } from "@/app/components/ui/Input/Input";
import DropdownInput from "@/app/components/ui/Inputs/DropdownInput";
import { apiClient } from "@/app/features/lib/api-client";
import { faCircleCheck, faMap } from "@fortawesome/free-solid-svg-icons";
import { register } from "module";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import styles from "./page.module.css"



export interface TripFormData {
    route_id: string;
    route_name?: string;
    vehicle_model_id: string;
    vehicle_model_name?: string;
    station_id: string;
    station_name?: string;
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

interface StationOption {
    id:string;
    station_name:string;
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
    const [stations, setStations] = useState<StationOption[]>([]);


    // useEffect(() => {
    //     if (initialData && 
    //         routes.length > 0 &&
    //         vehicleModels.length > 0 &&
    //         stations.length > 0
    //     ) {
    //         reset({
    //             ...initialData,
    //             route_id: String(initialData.route_id),
    //             vehicle_model_id: String(initialData.vehicle_model_id),
    //             station_id: String(initialData.station_id),
    //         });
    //     }
    // }, [initialData, reset]);


    useEffect(() => {
  if (!initialData) return;

  const route = routes.find(
    (r) => r.route_name === initialData.route_name
  );

  const model = vehicleModels.find(
    (m) => m.vehicle_model_name === initialData.vehicle_model_name
  );

  const station = stations.find(
    (s) => s.station_name === initialData.station_name
  );

  if (route && model && station) {
    reset({
      ...initialData,
      route_id: route.id,
      vehicle_model_id: model.id,
      station_id: station.id,
    });
  }
}, [initialData, routes, vehicleModels, stations, reset]);



    // fatch route,vehicle model 
    const fetchOptions=async()=>{
        try {
            const [routesResponse, vehicleModelsResponse, stationsResponse] = await Promise.all([
               apiClient.get("/master-trips/routes"),
               apiClient.get("/master-vehicle/vehicle-models"),
               apiClient.get("/master-company/stations"),
            ]);
            setRoutes(routesResponse.data);
            setVehicleModels(vehicleModelsResponse.items);
            setStations(stationsResponse.data);

        
        }
            catch (error) {
                console.error("Error fetching options:", error);
            }
    };
   

    useEffect(() => {
        fetchOptions();
        
    }, []);
    

    // console.log("Routes:", routes);
    // console.log("Vehicle Models:", vehicleModels);

    console.log("initialData", initialData);
console.log("routes", routes);
console.log("vehicleModels", vehicleModels);
console.log("stations", stations);




    return(

        <form id="tripForm" onSubmit={handleSubmit(onSubmit)}>

            <FormCard title="TRIP ASSIGNMENT" icon={faMap}>
                <div>
                        
                        <div className={styles.DropGroup}>
                        <DropdownInput
                        label="Route"
                        placeholder="Select Route"
                        options={routes.map(route=>({id:route.id,name:route.route_name}))}
                        {...register("route_id",{required:"Route is required"})}
                        error={errors.route_id?.message}
             
                     
                        />
                        {/* <DropdownInput
                        label="Route"
                        placeholder="Select Route"
                        options={routes.map((route,idx)=>({
                            id:route.id || `route-opt-${idx}`,
                            name:route.route_name,
                        }))}
                        valueKey="id"
                        nameKey="name"
                        {...register("route_id",{
                            required:mode === "create" ? "Route is required" :false,
                        })}
                        error={errors.route_id?.message as string}
                        /> */}
                        </div>

                        <div className={styles.DropGroup}>

                                 <DropdownInput
                            label="Vehicle Model"
                            placeholder="Select Vehicle Model"
                            options={vehicleModels.map(model => ({ id: model.id, name: model.vehicle_model_name }))}
                            {...register("vehicle_model_id", { required: "Vehicle Model is required" })}
                            error={errors.vehicle_model_id?.message}
                        />
                        </div>


                            <div className={styles.DropGroup}>

                                   <DropdownInput
                            label="Station"
                            placeholder="Select Station"
                            options={stations.map(station => ({ id: station.id, name: station.station_name }))}
                            {...register("station_id", { required: "Station is required" })}
                            error={errors.station_id?.message}
                        />

                            </div>
                   

                     
             

                
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


                                        <div className={styles.formActionArea}>
                         <NavigationBtn
                                href="#"
                                variant="cancel"
                                onClick={(e) => {
                                e.preventDefault();
                            onClose(); 
                            }}
                            >
  cancel
</NavigationBtn>


                <ActionBtn
                type="submit"
                form="tripForm"
                leftIcon={faCircleCheck}
                disabled={loading}
                >
                    {mode==="create" ? "Create Trip" : "Update Trip"}
                </ActionBtn>
            </div>


                     
                       
               



                </div>

            </FormCard>

        </form>





    )









}
