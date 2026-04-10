"use client";

import GridColumnsLayout from "@/app/components/layout/GridColumns/Layout/GridColumnLayout";
import styles from "./page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressCard,
  faArrowRight,
  faCar,
  faCaretRight,
  faClock,
  faSearch,
  faUndo,
  faUser,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import Column from "@/app/components/layout/GridColumns/Column/Column";
import ColumnCard from "@/app/components/layout/GridColumns/ColumnCard/ColumnCard";
import Image from "next/image";
import { useEffect, useState } from "react";
import { apiClient } from "@/app/features/lib/api-client";

type Driver = {
  id: string;
  driver_name: string;
  nrc: string;
  phone: string;
  license_no: string;
  image: string;
  status: string;
};

type Vehicle = {
  id: string;
  vehicle_name: string;
  license_plate: string;
  status: string;
  image: string;
  current_odometer: string;
};

type Assigned = {
  id: string;
  driver_id: string;
  driver_name: string;
  driver_image: string;
  driver_license: string;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_image: string;
  vehicle_license: string;
  createdAt: string;
  status: string;
};

export default function VehicleDriverAssignPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assigned, setAssigned] = useState<Assigned[]>([]);

  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const fetchApis = async () => {
    try {
      const [driversResponse, vehiclesResponse, assignedResponse] =
        await Promise.all([
          apiClient.get("http://localhost:3001/driver/list"),
          apiClient.get("http://localhost:3001/master-vehicle/vehicles"),
          apiClient.get(
            "http://localhost:3001/master-vehicle/vehicle-driver-assign",
          ),
        ]);
      setDrivers(driversResponse.items || []);
      setVehicles(vehiclesResponse.data || []);
      setAssigned(assignedResponse.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchApis();
  }, []);

  useEffect(() => {
    setShowModal(selectedDriverIds.length > 0 && selectedVehicleIds.length > 0);
  }, [selectedDriverIds, selectedVehicleIds]);

  const toggleSelection = (id: string, type: "driver" | "vehicle") => {
    if (type === "driver") {
      setSelectedDriverIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    } else {
      setSelectedVehicleIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    }
  };

  const confirmBulkAssignment = async () => {
    const pairCount = Math.min(
      selectedDriverIds.length,
      selectedVehicleIds.length,
    );
    try {
      const promises = [];
      for (let i = 0; i < pairCount; i++) {
        promises.push(
          apiClient.post(
            "http://localhost:3001/master-vehicle/vehicle-driver-assign",
            {
              driver_id: selectedDriverIds[i],
              vehicle_id: selectedVehicleIds[i],
            },
          ),
        );
      }
      await Promise.all(promises);
      await fetchApis();
      cancelSelection();
    } catch (error) {
      alert("Error during bulk assignment.");
      fetchApis();
    }
  };

  const cancelSelection = () => {
    setSelectedDriverIds([]);
    setSelectedVehicleIds([]);
    setShowModal(false);
  };

  const completeTrip = async (assignId: string) => {
    try {
      await apiClient.patch(
        `http://localhost:3001/master-vehicle/vehicle-driver-assign/${assignId}/complete`,
      );
      setAssigned((prev) => prev.filter((item) => item.id !== assignId));
      fetchApis();
    } catch (error) {
      console.error("Failed to complete trip:", error);
    }
  };

  const formatSmartDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    return date.toDateString() === now.toDateString()
      ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString("en-CA");
  };

  // Helper to get selection number
  const getSelectionIndex = (id: string, type: "driver" | "vehicle") => {
    const list = type === "driver" ? selectedDriverIds : selectedVehicleIds;
    const index = list.indexOf(id);
    return index !== -1 ? index + 1 : null;
  };

  return (
    <div className={styles.container}>
      <GridColumnsLayout>
        {/* Drivers Column - Only Active */}
        <Column
          leftIcon={<FontAwesomeIcon icon={faUser} />}
          title="Available Drivers"
          count={drivers.filter((d) => d.status === "Active").length}
          searchSlot={
            <TextInput
              placeholder="Search Active Drivers"
              leftIcon={faSearch}
            />
          }
        >
          {drivers
            .filter((d) => d.status === "Active")
            .map((driver) => {
              const selectionNum = getSelectionIndex(driver.id, "driver");
              return (
                <div
                  key={driver.id}
                  onClick={() => toggleSelection(driver.id, "driver")}
                  className={`${styles.cardWrapper} ${selectionNum ? styles.activeSelection : ""}`}
                  style={{ position: "relative", cursor: "pointer" }}
                >
                  {selectionNum && (
                    <div className={styles.selectionBadge}>{selectionNum}</div>
                  )}
                  <ColumnCard
                    badge={driver.license_no}
                    image={driver.image}
                    title={driver.driver_name}
                    nrc={driver.nrc}
                    phone={driver.phone}
                  />
                </div>
              );
            })}
        </Column>

        {/* Vehicles Column - Only Active */}
        <Column
          leftIcon={<FontAwesomeIcon icon={faCar} />}
          title="Available Vehicles"
          count={vehicles.filter((v) => v.status === "Active").length}
          searchSlot={
            <TextInput
              placeholder="Search Active Vehicles"
              leftIcon={faSearch}
            />
          }
        >
          {vehicles
            .filter((v) => v.status === "Active")
            .map((vehicle) => {
              const selectionNum = getSelectionIndex(vehicle.id, "vehicle");
              return (
                <div
                  key={vehicle.id}
                  onClick={() => toggleSelection(vehicle.id, "vehicle")}
                  className={`${styles.cardWrapper} ${selectionNum ? styles.activeSelection : ""}`}
                  style={{ position: "relative", cursor: "pointer" }}
                >
                  {selectionNum && (
                    <div
                      className={styles.selectionBadge}
                      style={{ backgroundColor: "#10b981" }}
                    >
                      {selectionNum}
                    </div>
                  )}
                  <ColumnCard
                    badge={vehicle.license_plate}
                    backgroundImage={vehicle.image}
                    title={vehicle.vehicle_name}
                    odometer={vehicle.current_odometer}
                  />
                </div>
              );
            })}
        </Column>

        {/* In-Transit Column */}
        <Column
          leftIcon={<FontAwesomeIcon icon={faCaretRight} />}
          title="In-Transit"
          count={assigned.filter((a) => a.status === "Ongoing").length}
          searchSlot={
            <TextInput placeholder="Search Assigns" leftIcon={faSearch} />
          }
        >
          {assigned
            .filter((assign) => assign.status === "Ongoing")
            .map((assign) => (
              <div className={styles.assignedCard} key={assign.id}>
                <div className={styles.assignedCardHeader}>
                  <div className={styles.assignedCardHeaderContent}>
                    <div className={styles.assignedCardHeaderImage}>
                      <Image
                        src={assign.driver_image}
                        alt="D"
                        width={40}
                        height={40}
                        unoptimized
                      />
                    </div>
                    <FontAwesomeIcon icon={faArrowRight} />
                    <div className={styles.assignedCardHeaderImage}>
                      <Image
                        src={assign.vehicle_image}
                        alt="V"
                        width={40}
                        height={40}
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className={styles.assignedCardHeaderBadge}>
                    <FontAwesomeIcon icon={faClock} />{" "}
                    {formatSmartDate(assign.createdAt)}
                  </div>
                </div>
                <div className={styles.assignedCardBody}>
                  <div className={styles.assignedCardCar}>
                    <FontAwesomeIcon icon={faCar} /> {assign.vehicle_name}
                  </div>
                  <div className={styles.assignedCardLicense}>
                    {assign.vehicle_license}
                  </div>
                </div>
                <hr className={styles.assignedCardSeparator} />
                <div className={styles.assignedCardBody}>
                  <div className={styles.assignedCardCar}>
                    <FontAwesomeIcon icon={faUser} /> {assign.driver_name}
                  </div>
                  <div className={styles.assignedCardLicense}>
                    <FontAwesomeIcon icon={faAddressCard} />{" "}
                    {assign.driver_license}
                  </div>
                </div>
                <div className={styles.assignedCardFooter}>
                  <button
                    className={styles.assignBtn}
                    onClick={() => completeTrip(assign.id)}
                  >
                    <FontAwesomeIcon icon={faUndo} /> Complete Trip
                  </button>
                </div>
              </div>
            ))}
        </Column>
      </GridColumnsLayout>

      {/* MULTI-SELECT BOTTOM MODAL */}
      {showModal && (
        <div className={styles.bottomModal}>
          <div className={styles.modalContent}>
            <p>
              Pair <strong>{selectedDriverIds.length}</strong> drivers with{" "}
              <strong>{selectedVehicleIds.length}</strong> vehicles?
              {selectedDriverIds.length !== selectedVehicleIds.length && (
                <small style={{ marginLeft: "10px", opacity: 0.8 }}>
                  (
                  {Math.min(
                    selectedDriverIds.length,
                    selectedVehicleIds.length,
                  )}{" "}
                  pairs will be created)
                </small>
              )}
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.confirmBtn}
                onClick={confirmBulkAssignment}
              >
                <FontAwesomeIcon icon={faCheck} /> Confirm Assignments
              </button>
              <button className={styles.cancelBtn} onClick={cancelSelection}>
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
