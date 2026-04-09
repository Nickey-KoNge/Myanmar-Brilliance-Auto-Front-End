"use client";

import { apiClient } from "@/app/features/lib/api-client";
import { use, useEffect, useState } from "react";
import { VehicleForm } from "../components/VehicleForm";
import { useRouter } from "next/navigation";



 {/* "vehicle_name": "Vigo",
        "station_id": "019d6191-ed23-767b-b162-8f920c17697c",
        "group_id": "bfaa4532-5f44-4d99-bc12-8cb49df66a8d",
        "vehicle_model_id": "bfa5b2f2-c714-44b5-ad3c-4da9e51cc10d",
        "supplier_id": null,
        "city_taxi_no": "1111111111",
        "serial_no": "1111111111111111",
        "vin_no": "111111111111111",
        "engine_no": "M11111",
        "license_plate": "12M\\124",
        "color": "yellow",
        "license_type": "failed",
        "current_odometer": "12km",
        "vehicle_license_exp": "2000-1-12",
        "service_intervals": "2000-3-12",
        "purchase_date": "2024-2-1",
        "image": "http://localhost:3001/uploads/vehicle/02786ac9-0278-7b0e-bb66-77daa49e74f7.jpg",
        "status": "Active", */}

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



    


export default function AddVehiclePage() {
        const router = useRouter();

    const [stations, setStations] = useState<Station[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
    const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stationsRes, groupsRes, vehicleModelsRes] = await Promise.all([
                    apiClient.get("/master-company/stations"),
                    apiClient.get("/group/list"),
                    apiClient.get("/vehicle-model/list"),
                
                ]);
                setStations(stationsRes.data);
                setGroups(groupsRes?.data|| groupsRes.items);
                setVehicleModels(vehicleModelsRes?.data || vehicleModelsRes.items || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    console.log("Stations:", stations);
    console.log("Groups:", groups);
    console.log("Vehicle Models:", vehicleModels);

    // const handleSubmit = async (data: unknown) => {
    //     try {
    //         console.log("Data received from form:", data);
    //         await apiClient.post("/master-vehicle/vehicles", data);
    //         router.push("/vehicle");
    //     } catch (error) {
    //         console.error("Error creating vehicle:", error);
    //     }
    // };
const handleSubmit = async (data: any) => {
    try {
        const formData = new FormData();
        const fields = [
            "group_id",
            "vehicle_model_id",
            "station_id",
            "license_plate",
            "license_type",
            "vehicle_license_exp",
            "purchase_date",
            "service_intervals",
            "city_taxi_no",
            "vehicle_name",
            "serial_no",
            "color",
            "vin_no",
            "engine_no",
            "current_odometer",
        ];
        fields.forEach((field) => {
            if (data[field] !== undefined && data[field] !== null) {
                formData.append(field, data[field]);
            }
        });

       
        if (data.image && data.image.length > 0) {
            formData.append("image", data.image[0]);
        }

        await apiClient.post("/master-vehicle/vehicles", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        router.push("/vehicle");
    } catch (error) {
        console.error("Error creating vehicle:", error);
    }
};

    return (
        <VehicleForm
            mode="create"
            onSubmit={handleSubmit}
            initialData={{}}
            loading={false}
            stations={stations}
            groups={groups}
            vehicleModels={vehicleModels}
        
        />
    );
    
}