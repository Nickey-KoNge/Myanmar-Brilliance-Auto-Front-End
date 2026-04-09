"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/features/lib/api-client";
import { set } from "react-hook-form";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faClockRotateLeft, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FilterState, useFilters } from "@/app/hooks/userFilters";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";

import styles from "./page.module.css"
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import DateInput from "@/app/components/ui/SearchBoxes/DateInput";
import DropdownInput from "@/app/components/ui/SearchBoxes/DropdownInput";

import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import { Pagination } from "@/app/components/ui/Pagination/Pagination";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import { DataTable } from "@/app/components/ui/DataTable/DataTable";
import DeleteModal from "@/app/components/ui/Delete/DeleteModal";
interface Vehicle {
    id: string;
    vehicle_name: string;
    station_name: string;
    group_name: string;
    vehicle_model_name: string;
    license_plate: string;
    color: string;
    status: string;
    image?: string;


}

interface StationOption {
    id: string;
    station_name:string;
}

interface GroupOption {
    id: string;
    group_name: string;
}

interface VehicleModelOption {
    id: string;
    vehicle_model_name: string;
}

interface SupplierOption {
    id: string;
    name: string;
}



export default function VehicleListPage() {
    const router = useRouter();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
   

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const [stations, setStations] = useState<StationOption[]>([]);
    const [groups, setGroups] = useState<GroupOption[]>([]);
    const [vehicleModels, setVehicleModels] = useState<VehicleModelOption[]>([]);
    const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);

    const PAGE_SIZE = 10;

      const [activeFilters, setActiveFilters] = useState<FilterState>({
        search: "",
        startDate: "",
        endDate: "",
      });


      const { filters, updateFilter, resetFilters } = useFilters(
        { search: "", startDate: "", endDate: "" },
        (debouncedFilters: FilterState) => {
            const isFilterChanged =
            activeFilters.search !== debouncedFilters.search ||
            activeFilters.startDate !== debouncedFilters.startDate ||
            activeFilters.endDate !== debouncedFilters.endDate;
            setActiveFilters(debouncedFilters);

            if (isFilterChanged) {
                setCurrentPage(1);
            }
        },
      );
  


 

       


    const columns = [
        {
            header: "Vehicle Info",
            key: "vehicle_name",
            render: (vehicle: Vehicle) => (

           

                     <div className={styles.staffInfo}>
          <Image
            src={vehicle.image || "/default-user.png"}
            alt={vehicle.vehicle_name}
            width={40}
            height={40}
            unoptimized
            className={styles.staffImg}
          />
          {vehicle.vehicle_name}{vehicle.image ? "" : " (No Image)"}
        </div>
                
            ),
        },
     {       header: "Model", key: "vehicle_model_name" },
     {       header: "License Plate", key: "license_plate" },
     {       header: "Color", key: "color" },
     {       header: "Status", key: "status" },
     {       header: "Station", key: "station_name" },
     {       header: "Group", key: "group_name" },
     {
            header: "Actions",
            key: "actions",
            render: (vehicle: any) => (
                <button
          className={styles.deleteBtn}

                onClick={(e)=>{
                    e.stopPropagation();
                    setSelectedVehicle(vehicle);
                    setIsDeleteOpen(true);
                }}>

                    <FontAwesomeIcon icon={faTrashCan} />


                </button>
            ),
     }
    
     
    ];  

    useEffect((   ) => {

        const fetchData = async () => {
            try {
                const params: Record<string, string> = {
                    page: currentPage.toString(),
                    limit: PAGE_SIZE.toString(),
                };
                if (activeFilters.search) params.search = activeFilters.search;
                if (activeFilters.startDate) params.startDate = activeFilters.startDate;
                if (activeFilters.endDate) params.endDate = activeFilters.endDate;
                const queryString = new URLSearchParams(params).toString();
                const response = await apiClient.get(`/master-vehicle/vehicles?${queryString}`);
                const res = response as unknown as {
                    data?: Vehicle[] | { data?: Vehicle[]; total?: number; totalPages?: number };
                    total?: number;
                    totalPages?: number;
                };

                let vehicleList: Vehicle[] = [];
                let total = 0;
                let totalPagesCount = 1;
                if (res && typeof res === "object") {
                    if (Array.isArray(res.data)) {
                        vehicleList = res.data;
                        total = res.total || 0;
                        totalPagesCount = res.totalPages || 1; 
                    } else if (
                        res.data &&
                        typeof res.data === "object" &&
                        Array.isArray(res.data.data)
                    ) {
                        vehicleList = res.data.data;
                        total = res.data.total || 0;
                        totalPagesCount = res.data.totalPages || 1;
                    }
                }
                setVehicles(vehicleList);
                setTotalRecords(total);
                setTotalPages(totalPagesCount);
            } catch (error) {
                setVehicles([]);
            }
        }
            fetchData();

    }, [currentPage, activeFilters]);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [stationsResponse, groupsResponse, vehicleModelsResponse] = await Promise.all([
                    apiClient.get("/master-company/stations"),
                    apiClient.get("/group/list"),
                    apiClient.get("/vehicle-model/list"),
                
                ]);
                setStations(stationsResponse.data || []);
                setGroups(groupsResponse?.data || groupsResponse.items || []);
                setVehicleModels(vehicleModelsResponse?.data || vehicleModelsResponse.items || []);
               
            } catch (error) {
                console.error("Error fetching filters:", error);
            }
        };
        fetchFilters();
    }, []);


    

    console.log("Vehicles:", vehicles);
    console.log("Stations:", stations);
    console.log("Groups:", groups);
    console.log("Vehicle Models:", vehicleModels);

     const handleDeleteSuccess = (id: string) => {
       setVehicles((prevData) => prevData.filter((row) => row.id !== id));
  };


    return (
        <>
        <PageGridLayout
         sidebar={
          <div className={styles.sidebarWrapper}>
            <div className={styles.topSection}>
              <p className={styles.gridBoxTitle}>VEHICLE MASTER RECORDS</p>
              <hr className={styles.cuttingLine} />

              <div className={styles.searchContainer}>
                <TextInput
                  label="Searching"
                  placeholder="Search by name, email..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />

                <div className={styles.filterRow}>
                  <DateInput
                    label="From"
                    value={filters.startDate}
                    onChange={(e) => updateFilter("startDate", e.target.value)}
                    rightIcon={faCalendarDays}
                  />
                  <DateInput
                    label="To"
                    value={filters.endDate}
                    onChange={(e) => updateFilter("endDate", e.target.value)}
                    rightIcon={faCalendarDays}
                  />
                </div>

                <div className={styles.filterRow}>
                  <DropdownInput
                    label="Vehicle Model"
                    options={vehicleModels.map((v) => ({
                      id: v.id,
                      name: v.vehicle_model_name,
                    }))}
                    valueKey="id"
                    nameKey="name"
                    value={(filters.branchId as string) || ""}
                    onChange={(e) => updateFilter("branchId", e.target.value)}
                    placeholder="All Vehicle Models"
                  />

                  <DropdownInput
                    label="Station"
                    options={stations.map((s) => ({
                      id: s.id,
                      name: s.station_name,
                    }))}
                    valueKey="id"
                    nameKey="name"
                    value={(filters.roleId as string) || ""}
                    onChange={(e) => updateFilter("roleId", e.target.value)}
                    placeholder="All Stations"
                  />

                      <DropdownInput
                    label="Station"
                    options={groups.map((g) => ({
                      id: g.id,
                      name: g.group_name,
                    }))}
                    valueKey="id"
                    nameKey="name"
                    value={(filters.roleId as string) || ""}
                    onChange={(e) => updateFilter("roleId", e.target.value)}
                    placeholder="All Group"
                  />
                </div>

                <div style={{ alignSelf: "flex-start" }}>
                  <ActionBtn
                    type="reset"
                    variant="action"
                    fullWidth={false}
                    onClick={resetFilters}
                  >
                    reset
                  </ActionBtn>
                </div>
              </div>
            </div>

            <div className={styles.bottomSection}>
              <hr className={styles.cuttingLine} />

              <div className={styles.recentRecord}>
                <span>
                  <FontAwesomeIcon icon={faClockRotateLeft} />
                </span>
                <p className={styles.recentTitle}>RECENT RECORD</p>
                <span />

                <div className={styles.stat}>
                  <div>
                    <p className={styles.statLable}>Total Staff :</p>
                    <p className={styles.textDanger}>{totalRecords}</p>
                  </div>
                  <div>
                    <p className={styles.statLable}>Active Staff :</p>
                    <p className={styles.textSuccess}>36</p>
                  </div>
                  <div>
                    <p className={styles.statLable}>Inactive Staff :</p>
                    <p className={styles.textDanger}>4</p>
                  </div>
                </div>
              </div>

              <hr className={styles.cuttingLine} />
              <p className={styles.lastEdited}>
                Last Edited :{" "}
                <span className={styles.spanText}>Nickey (Admin)</span>
              </p>
            </div>
          </div>
        }
        >

              <div>
          <div className={styles.tableHeaderArea}>
            <div className={styles.paginationInfoWrapper}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
                showOnlyInfo={true}
              />
            </div>
            <p className={styles.tableTitle}>EMPLOYEE MASTER RECORDS</p>

            <div className={styles.headerActionArea}>
              <NavigationBtn href="/vehicle/Addvehicle" leftIcon={faPlus}>
                Add Vehicle
              </NavigationBtn>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={vehicles}
            onRowClick={(vehicle) =>
              router.push(`/vehicle/Updatevehicle/${vehicle.id}`)
            }
            emptyMessage="No vehicle records found."
          />
        </div>



        </PageGridLayout>


          {isDeleteOpen && selectedVehicle && (
                <DeleteModal
                  isOpen={isDeleteOpen}
                  onClose={() => setIsDeleteOpen(false)}
                  itemName={selectedVehicle.vehicle_name}
                  name="Vehicle"
                  id={selectedVehicle.id}
                  apiRoute="master-vehicle/vehicles"
                  onDeleteSuccess={handleDeleteSuccess}
                />
              )}



       
        </>
        );
}