"use client";

import { apiClient } from "@/app/features/lib/api-client";
import { use, useEffect, useState } from "react";
import { VehicleForm } from "@/app/(dashboard)/vehicle/components/VehicleForm";
import { useParams, useRouter } from "next/navigation";
import { FieldValue } from "react-hook-form";



interface Vehicle {
    id: string;
    vehicle_name: string;
    station_id: string;
    group_id: string;
    vehicle_model_id: string;   
    supplier_id: string | null;
    city_taxi_no: string;
    serial_no: string;
    vin_no: string;
    engine_no: string;
    license_plate: string;
    color: string;
    license_type: string;
    current_odometer: string;
    vehicle_license_exp: string;
    service_intervals: string;
    purchase_date: string;
    image: string;
}

interface Station {
    id: string;
    station_name: string;
}

interface Group {
    id: string;
    group_name: string;
}

interface VehicleModel {
    id: string;
    vehicle_model_name: string;
}


export default function UpdateVehicle(){
    
    const params=useParams();
    const vehicleId=params.id;
    const router=useRouter();
    console.log("Current ID from URL:", vehicleId);

    const [vehicleData, setVehicleData] = useState<Vehicle | undefined>(undefined);
    const [stations, setStations] = useState<Station[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);



    useEffect(() => {
        const fetchVehicleData = async () => {
            try {
                const response = await apiClient.get(`/master-vehicle/vehicles/${vehicleId}`);

                const rawData = (response as { data?: unknown }).data || response;
                const typedData = rawData as Vehicle;

                if (typedData && typeof typedData === "object") {
                    setVehicleData({
                        ...typedData,
                        station_id: typedData.station_id || "",
                        group_id: typedData.group_id || "",
                        vehicle_model_id: typedData.vehicle_model_id || "",
                    })
                };


                
            } catch (error) {
                console.error("Error fetching vehicle data:", error);
            }
        };
        fetchVehicleData();
    }, [vehicleId]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stationsRes, groupsRes, vehicleModelsRes] = await Promise.all([
                    apiClient.get("/master-company/stations"),
                    apiClient.get("/group/list"),
                    apiClient.get("/vehicle-model/list"),
                ]);
                setStations(stationsRes.data);
                setGroups(groupsRes?.data || groupsRes.items);
                setVehicleModels(vehicleModelsRes?.data || vehicleModelsRes.items);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);


      
        // const { 
        //     image, 
        //     supplier_id, 
        //     station_id, 
        //     station_name, 
        //     group_id, 
        //     group_name, 
        //     vehicle_model_id, 
        //     vehicle_model_name,
          
        //     ...cleanPayload 
        // } = data;
const handleUpdate = async (data: any) => {
    try {
        const formData = new FormData();


        const cleanFields = [
            'station_name', 
            'group_name', 
            'vehicle_model_name', 
            'id'
        ];

     
        Object.keys(data).forEach((key) => {
            if (cleanFields.includes(key)) return;

            const value = data[key];

                if (key === 'image') {
                    if (value && typeof value !== "string" && value.length > 0) {
                    formData.append('image', value[0]);
                }
            }
         
            else if (value !== null && value !== undefined && value !== "") {
                formData.append(key, value);
            }
        });

        console.log("Sending FormData update...");

        await apiClient.patch(`/master-vehicle/vehicles/${vehicleId}`, formData);
        
        router.push("/vehicle");
    } catch (error: any) {
  
        console.error("Error updating vehicle:", error.response?.data || error.message);
    }
};



       console.log("Vehicle Update Data:", vehicleData);
    console.log("Stations Update Data:", stations);
    console.log("Groups Update Data:", groups);
    console.log("Vehicle Models Update Data:", vehicleModels);

    if (!vehicleData) {
        return <div>Loading...</div>;
    }

 



    return (
        <VehicleForm
            mode="update"
            initialData={vehicleData}
            stations={stations}
            groups={groups}
            vehicleModels={vehicleModels}
            onSubmit={handleUpdate}
        />
    );





    }