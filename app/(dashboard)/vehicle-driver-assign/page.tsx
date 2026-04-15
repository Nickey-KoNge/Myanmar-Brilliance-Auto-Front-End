// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faAddressCard,
//   faArrowRight,
//   faCar,
//   faCaretRight,
//   faClock,
//   faSearch,
//   faUndo,
//   faUser,
//   faCheck,
//   faTimes,
//   faPhone,
//   faFilter,
// } from "@fortawesome/free-solid-svg-icons";

// import GridColumnsLayout from "@/app/components/layout/GridColumns/Layout/GridColumnLayout";
// import Column from "@/app/components/layout/GridColumns/Column/Column";
// import ColumnCard from "@/app/components/layout/GridColumns/ColumnCard/ColumnCard";
// import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
// import Image from "next/image";
// import { apiClient } from "@/app/features/lib/api-client";
// import styles from "./page.module.css";

// // --- Types ---
// type Driver = {
//   id: string;
//   driver_name: string;
//   nrc: string;
//   phone: string;
//   license_no: string;
//   image: string;
//   status: string;
// };

// type Vehicle = {
//   id: string;
//   vehicle_name: string;
//   license_plate: string;
//   status: string;
//   image: string;
//   current_odometer: string;
// };

// type Assigned = {
//   id: string;
//   driver_id: string;
//   driver_name: string;
//   driver_image: string;
//   driver_nrc: string;
//   driver_license_type: string;
//   driver_license: string;
//   phone: string;
//   vehicle_id: string;
//   vehicle_name: string;
//   vehicle_image: string;
//   vehicle_license: string;
//   createdAt: string;
//   status: string;
// };

// export default function VehicleDriverAssignPage() {
//   const [drivers, setDrivers] = useState<Driver[]>([]);
//   const [vehicles, setVehicles] = useState<Vehicle[]>([]);
//   const [assigned, setAssigned] = useState<Assigned[]>([]);

//   // --- Search & Filter States ---
//   const [driverSearch, setDriverSearch] = useState("");
//   const [vehicleSearch, setVehicleSearch] = useState("");
//   const [assignSearch, setAssignSearch] = useState("");
//   // New state for horizontal filter
//   const [selectedVehicleName, setSelectedVehicleName] = useState<string | null>(
//     null,
//   );

//   // Selection
//   const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);
//   const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
//   const [showModal, setShowModal] = useState(false);

//   // Drag
//   const [draggedDriverId, setDraggedDriverId] = useState<string | null>(null);
//   const [dropTargetId, setDropTargetId] = useState<string | null>(null);

//   // Driver Modal
//   const [hoveredAssign, setHoveredAssign] = useState<Assigned | null>(null);
//   const [modalPos, setModalPos] = useState({ x: 0, y: 0 });

//   // --- Fetch ---
//   const fetchApis = async () => {
//     try {
//       const [driversRes, vehiclesRes, assignedRes] = await Promise.all([
//         apiClient.get("http://localhost:3001/master-company/driver"),
//         apiClient.get("http://localhost:3001/master-vehicle/vehicles"),
//         apiClient.get(
//           "http://localhost:3001/master-vehicle/vehicle-driver-assign",
//         ),
//       ]);

//       setDrivers(driversRes.items || []);
//       setVehicles(vehiclesRes.data || []);
//       setAssigned(assignedRes.data || []);
//     } catch (error) {
//       console.error("Fetch error:", error);
//     }
//   };

//   useEffect(() => {
//     fetchApis();
//   }, []);

//   // --- Filtered Lists ---
//   const filteredDrivers = useMemo(() => {
//     return drivers
//       .filter((d) => d.status === "Active")
//       .filter(
//         (d) =>
//           d.driver_name.toLowerCase().includes(driverSearch.toLowerCase()) ||
//           d.license_no.toLowerCase().includes(driverSearch.toLowerCase()),
//       );
//   }, [drivers, driverSearch]);

//   // --- Unique Vehicle Names for Filter ---
//   const uniqueVehicleNames = useMemo(() => {
//     const names = vehicles.map((v) => v.vehicle_name);
//     return Array.from(new Set(names)).sort();
//   }, [vehicles]);

//   const filteredVehicles = useMemo(() => {
//     return vehicles
//       .filter((v) => v.status === "Active")
//       .filter((v) => {
//         const matchesSearch =
//           v.vehicle_name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
//           v.license_plate.toLowerCase().includes(vehicleSearch.toLowerCase());

//         const matchesNameFilter =
//           !selectedVehicleName || v.vehicle_name === selectedVehicleName;

//         return matchesSearch && matchesNameFilter;
//       });
//   }, [vehicles, vehicleSearch, selectedVehicleName]);

//   const filteredAssigned = useMemo(() => {
//     return assigned
//       .filter((a) => a.status === "Ongoing")
//       .filter(
//         (a) =>
//           a.driver_name.toLowerCase().includes(assignSearch.toLowerCase()) ||
//           a.vehicle_name.toLowerCase().includes(assignSearch.toLowerCase()) ||
//           a.vehicle_license.toLowerCase().includes(assignSearch.toLowerCase()),
//       );
//   }, [assigned, assignSearch]);

//   // --- Helpers ---
//   const formatSmartDate = (dateStr: string) => {
//     const date = new Date(dateStr);
//     const now = new Date();
//     return date.toDateString() === now.toDateString()
//       ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
//       : date.toLocaleDateString("en-CA");
//   };

//   const getSelectionIndex = (id: string, type: "driver" | "vehicle") => {
//     const list = type === "driver" ? selectedDriverIds : selectedVehicleIds;
//     const index = list.indexOf(id);
//     return index !== -1 ? index + 1 : null;
//   };

//   // --- Selection Logic ---
//   const handleDriverSelect = (id: string) => {
//     setSelectedDriverIds((prev) =>
//       prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
//     );
//   };

//   const handleVehicleSelect = (id: string) => {
//     setSelectedVehicleIds((prev) => {
//       if (prev.includes(id)) return prev.filter((i) => i !== id);
//       return selectedDriverIds.length === 1 ? [id] : [...prev, id];
//     });
//   };

//   const toggleSelection = (id: string, type: "driver" | "vehicle") => {
//     if (type === "driver") handleDriverSelect(id);
//     else handleVehicleSelect(id);
//   };

//   // --- Drag & Drop ---
//   const handleDragStart = (e: React.DragEvent, id: string) => {
//     setDraggedDriverId(id);
//     e.dataTransfer.setData("driverId", id);
//   };

//   const handleDrop = (e: React.DragEvent, vehicleId: string) => {
//     e.preventDefault();
//     const driverId = e.dataTransfer.getData("driverId");
//     setDropTargetId(null);
//     setDraggedDriverId(null);
//     if (!driverId) return;

//     setSelectedDriverIds((prevDrivers) => {
//       const nextDrivers = prevDrivers.includes(driverId)
//         ? prevDrivers
//         : [...prevDrivers, driverId];
//       setSelectedVehicleIds((prevVehicles) => {
//         if (prevVehicles.includes(vehicleId)) return prevVehicles;
//         return nextDrivers.length === 1
//           ? [vehicleId]
//           : [...prevVehicles, vehicleId];
//       });
//       return nextDrivers;
//     });
//   };

//   const handleDriverHover = (e: React.MouseEvent, assign: Assigned) => {
//     setHoveredAssign(assign);
//     setModalPos({ x: e.clientX, y: e.clientY });
//   };

//   const handleDriverLeave = () => setHoveredAssign(null);

//   useEffect(() => {
//     setShowModal(selectedDriverIds.length > 0 && selectedVehicleIds.length > 0);
//   }, [selectedDriverIds, selectedVehicleIds]);

//   const confirmAssignment = async () => {
//     if (selectedDriverIds.length !== selectedVehicleIds.length) {
//       alert("Driver and Vehicle count must match!");
//       return;
//     }
//     try {
//       const promises = selectedDriverIds.map((driverId, index) =>
//         apiClient.post(
//           "http://localhost:3001/master-vehicle/vehicle-driver-assign",
//           {
//             driver_id: driverId,
//             vehicle_id: selectedVehicleIds[index],
//           },
//         ),
//       );
//       await Promise.all(promises);
//       await fetchApis();
//       cancelSelection();
//     } catch (error) {
//       alert("Assignment failed!");
//     }
//   };

//   const cancelSelection = () => {
//     setSelectedDriverIds([]);
//     setSelectedVehicleIds([]);
//     setShowModal(false);
//   };

//   const completeTrip = async (assignId: string) => {
//     try {
//       await apiClient.patch(
//         `http://localhost:3001/master-vehicle/vehicle-driver-assign/${assignId}/complete`,
//       );
//       fetchApis();
//     } catch (error) {
//       console.error("Complete trip error:", error);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <GridColumnsLayout>
//         {/* Drivers */}
//         <Column
//           title="Available Drivers"
//           leftIcon={<FontAwesomeIcon icon={faUser} />}
//           count={filteredDrivers.length}
//           searchSlot={
//             <TextInput
//               placeholder="Search Drivers"
//               leftIcon={faSearch}
//               value={driverSearch}
//               onChange={(e) => setDriverSearch(e.target.value)}
//             />
//           }
//         >
//           {filteredDrivers.map((driver) => {
//             const index = getSelectionIndex(driver.id, "driver");
//             return (
//               <div
//                 key={driver.id}
//                 draggable
//                 onDragStart={(e) => handleDragStart(e, driver.id)}
//                 onClick={() => toggleSelection(driver.id, "driver")}
//                 className={`${styles.cardWrapper} ${index ? styles.activeSelection : ""} ${draggedDriverId === driver.id ? styles.dragging : ""}`}
//               >
//                 {index && <div className={styles.selectionBadge}>{index}</div>}
//                 <ColumnCard
//                   title={driver.driver_name}
//                   image={driver.image}
//                   badge={driver.license_no}
//                   nrc={driver.nrc}
//                   phone={driver.phone}
//                 />
//               </div>
//             );
//           })}
//         </Column>

//         {/* Vehicles */}
//         <Column
//           title="Available Vehicles"
//           leftIcon={<FontAwesomeIcon icon={faCar} />}
//           count={filteredVehicles.length}
//           searchSlot={
//             <TextInput
//               placeholder="Search Vehicles"
//               leftIcon={faSearch}
//               value={vehicleSearch}
//               onChange={(e) => setVehicleSearch(e.target.value)}
//             />
//           }
//           filterSlot={
//             <div className={styles.horizontalFilter}>
//               <button
//                 className={`${styles.filterChip} ${!selectedVehicleName ? styles.activeFilter : ""}`}
//                 onClick={() => setSelectedVehicleName(null)}
//               >
//                 All
//               </button>
//               {uniqueVehicleNames.map((name) => (
//                 <button
//                   key={name}
//                   className={`${styles.filterChip} ${selectedVehicleName === name ? styles.activeFilter : ""}`}
//                   onClick={() => setSelectedVehicleName(name === selectedVehicleName ? null : name)}
//                 >
//                   {name}
//                 </button>
//               ))}
//             </div>
//           }
//         >
//           {filteredVehicles.map((vehicle) => {
//             const index = getSelectionIndex(vehicle.id, "vehicle");
//             const isOver = dropTargetId === vehicle.id;
//             return (
//               <div
//                 key={vehicle.id}
//                 onDragOver={(e) => {
//                   e.preventDefault();
//                   setDropTargetId(vehicle.id);
//                 }}
//                 onDragLeave={() => setDropTargetId(null)}
//                 onDrop={(e) => handleDrop(e, vehicle.id)}
//                 onClick={() => toggleSelection(vehicle.id, "vehicle")}
//                 className={`${styles.cardWrapper} ${index ? styles.activeSelection : ""} ${isOver ? styles.dropTarget : ""}`}
//               >
//                 {index && (
//                   <div
//                     className={styles.selectionBadge}
//                     style={{ backgroundColor: "#10b981" }}
//                   >
//                     {index}
//                   </div>
//                 )}
//                 {isOver && (
//                   <div className={styles.dropOverlay}>Drop to assign</div>
//                 )}
//                 <ColumnCard
//                   title={vehicle.vehicle_name}
//                   backgroundImage={vehicle.image}
//                   badge={vehicle.license_plate}
//                   odometer={vehicle.current_odometer}
//                 />
//               </div>
//             );
//           })}
//         </Column>

//         {/* In Transit */}
//         <Column
//           leftIcon={<FontAwesomeIcon icon={faCaretRight} />}
//           title="In-Transit"
//           count={filteredAssigned.length}
//           searchSlot={
//             <TextInput
//               placeholder="Search Assigns"
//               leftIcon={faSearch}
//               value={assignSearch}
//               onChange={(e) => setAssignSearch(e.target.value)}
//             />
//           }
//         >
//           {filteredAssigned.map((assign) => (
//             <div className={styles.assignedCard} key={assign.id}>
//               <div className={styles.assignedCardHeader}>
//                 <div className={styles.assignedCardHeaderContent}>
//                   <div className={styles.assignedCardHeaderImage}>
//                     <Image
//                       src={assign.driver_image}
//                       alt="D"
//                       width={40}
//                       height={40}
//                       unoptimized
//                     />
//                   </div>
//                   <FontAwesomeIcon icon={faArrowRight} />
//                   <div className={styles.assignedCardHeaderImage}>
//                     <Image
//                       src={assign.vehicle_image}
//                       alt="V"
//                       width={40}
//                       height={40}
//                       unoptimized
//                     />
//                   </div>
//                 </div>
//                 <div className={styles.assignedCardHeaderBadge}>
//                   <FontAwesomeIcon icon={faClock} />{" "}
//                   {formatSmartDate(assign.createdAt)}
//                 </div>
//               </div>

//               <div className={styles.assignedCardBody}>
//                 <div className={styles.assignedCardCar}>
//                   <FontAwesomeIcon icon={faCar} /> {assign.vehicle_name}
//                 </div>
//                 <div className={styles.assignedCardLicense}>
//                   {assign.vehicle_license}
//                 </div>
//               </div>

//               <hr className={styles.assignedCardSeparator} />

//               <div className={styles.assignedCardBody}>
//                 <div
//                   className={styles.assignedCardCar}
//                   style={{ cursor: "pointer" }}
//                   onMouseEnter={(e) => handleDriverHover(e, assign)}
//                   onMouseMove={(e) =>
//                     setModalPos({ x: e.clientX, y: e.clientY })
//                   }
//                   onMouseLeave={handleDriverLeave}
//                   onClick={(e) => handleDriverHover(e, assign)}
//                 >
//                   <FontAwesomeIcon icon={faUser} /> {assign.driver_name}
//                 </div>
//                 <div className={styles.assignedCardLicense}>
//                   <FontAwesomeIcon icon={faAddressCard} />{" "}
//                   {assign.driver_license}
//                 </div>
//               </div>

//               <div className={styles.assignedCardFooter}>
//                 <button
//                   className={styles.assignBtn}
//                   onClick={() => completeTrip(assign.id)}
//                 >
//                   <FontAwesomeIcon icon={faUndo} /> Complete Trip
//                 </button>
//               </div>
//             </div>
//           ))}
//         </Column>
//       </GridColumnsLayout>
//       {/* 1. Selection Confirmation Modal (Bottom Bar) */}
//       {showModal && (
//         <div className={styles.bottomModal}>
//           <div className={styles.modalContent}>
//             <p>
//               Assign <strong>{selectedDriverIds.length}</strong> driver(s) to{" "}
//               <strong>{selectedVehicleIds.length}</strong> vehicle(s)?
//             </p>
//             <div className={styles.modalActions}>
//               <button className={styles.confirmBtn} onClick={confirmAssignment}>
//                 <FontAwesomeIcon icon={faCheck} /> Confirm
//               </button>
//               <button className={styles.cancelBtn} onClick={cancelSelection}>
//                 <FontAwesomeIcon icon={faTimes} /> Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 2. Driver Info Hover/Click Modal (Floating) */}
//       {hoveredAssign && (
//         <div
//           className={styles.driverFloatingModal}
//           style={{
//             top: modalPos.y - 140,
//             left: modalPos.x + 15,
//           }}
//         >
//           <div className={styles.modalTitle}>
//             <Image
//               src={hoveredAssign.driver_image}
//               alt="Driver"
//               width={40}
//               height={40}
//               unoptimized
//             />
//             {hoveredAssign.driver_name}
//           </div>

//           <div className={styles.modalRow}>
//             <span className={styles.modalLabel}>
//               <FontAwesomeIcon icon={faAddressCard} />
//             </span>
//             <strong className={styles.modalValue}>
//               {hoveredAssign.driver_nrc}
//             </strong>
//           </div>

//           <div className={styles.modalRow}>
//             <span className={styles.modalLabel}>
//               <FontAwesomeIcon icon={faPhone} />
//             </span>
//             <span className={styles.modalValue}>{hoveredAssign.phone}</span>
//           </div>

//           <div className={styles.modalRow}>
//             <span className={styles.modalLabel}>
//               {hoveredAssign.driver_license_type}
//             </span>
//             <span className={styles.modalValue}>
//               {hoveredAssign.driver_license}
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useMemo } from "react";
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
  faPhone,
} from "@fortawesome/free-solid-svg-icons";

import GridColumnsLayout from "@/app/components/layout/GridColumns/Layout/GridColumnLayout";
import Column from "@/app/components/layout/GridColumns/Column/Column";
import ColumnCard from "@/app/components/layout/GridColumns/ColumnCard/ColumnCard";
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import Image from "next/image";
import { apiClient } from "@/app/features/lib/api-client";
import styles from "./page.module.css";

// --- Types ---
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
  driver_nrc: string;
  driver_license_type: string;
  driver_license: string;
  phone: string;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_image: string;
  vehicle_license: string;
  createdAt: string;
  status: string;
};

// API Response Types
type DriverApiResponse = { items?: Driver[] };
type VehicleApiResponse = { data?: Vehicle[] };
type AssignedApiResponse = { data?: Assigned[] };

export default function VehicleDriverAssignPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assigned, setAssigned] = useState<Assigned[]>([]);

  // --- Search & Filter States ---
  const [driverSearch, setDriverSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [assignSearch, setAssignSearch] = useState("");
  // New state for horizontal filter
  const [selectedVehicleName, setSelectedVehicleName] = useState<string | null>(
    null,
  );

  // Selection
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);

  // 🛑 Derived State: useState, useEffect အစား တိုက်ရိုက်တွက်ယူပါသည် (ESLint Error ကင်းရှင်းစေရန်)
  const showModal =
    selectedDriverIds.length > 0 && selectedVehicleIds.length > 0;

  // Drag
  const [draggedDriverId, setDraggedDriverId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // Driver Modal
  const [hoveredAssign, setHoveredAssign] = useState<Assigned | null>(null);
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });

  // --- Fetch ---
  // 🛑 API Fetch function ကို useEffect အတွင်းတွင် တိုက်ရိုက်ရေးသားခြင်း
  useEffect(() => {
    const fetchApis = async () => {
      try {
        const [driversRes, vehiclesRes, assignedRes] = await Promise.all([
          apiClient.get(
            "http://localhost:3001/master-company/driver",
          ) as Promise<unknown>,
          apiClient.get(
            "http://localhost:3001/master-vehicle/vehicles",
          ) as Promise<unknown>,
          apiClient.get(
            "http://localhost:3001/master-vehicle/vehicle-driver-assign",
          ) as Promise<unknown>,
        ]);

        const typedDriversRes = driversRes as DriverApiResponse;
        const typedVehiclesRes = vehiclesRes as VehicleApiResponse;
        const typedAssignedRes = assignedRes as AssignedApiResponse;

        setDrivers(typedDriversRes.items || []);
        setVehicles(typedVehiclesRes.data || []);
        setAssigned(typedAssignedRes.data || []);
      } catch (error: unknown) {
        console.error("Fetch error:", error);
      }
    };

    fetchApis();
  }, []);

  // --- Filtered Lists ---
  const filteredDrivers = useMemo(() => {
    return drivers
      .filter((d) => d.status === "Active")
      .filter(
        (d) =>
          d.driver_name.toLowerCase().includes(driverSearch.toLowerCase()) ||
          d.license_no.toLowerCase().includes(driverSearch.toLowerCase()),
      );
  }, [drivers, driverSearch]);

  // --- Unique Vehicle Names for Filter ---
  const uniqueVehicleNames = useMemo(() => {
    const names = vehicles.map((v) => v.vehicle_name);
    return Array.from(new Set(names)).sort();
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => v.status === "Active")
      .filter((v) => {
        const matchesSearch =
          v.vehicle_name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
          v.license_plate.toLowerCase().includes(vehicleSearch.toLowerCase());

        const matchesNameFilter =
          !selectedVehicleName || v.vehicle_name === selectedVehicleName;

        return matchesSearch && matchesNameFilter;
      });
  }, [vehicles, vehicleSearch, selectedVehicleName]);

  const filteredAssigned = useMemo(() => {
    return assigned
      .filter((a) => a.status === "Ongoing")
      .filter(
        (a) =>
          a.driver_name.toLowerCase().includes(assignSearch.toLowerCase()) ||
          a.vehicle_name.toLowerCase().includes(assignSearch.toLowerCase()) ||
          a.vehicle_license.toLowerCase().includes(assignSearch.toLowerCase()),
      );
  }, [assigned, assignSearch]);

  // --- Helpers ---
  const formatSmartDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    return date.toDateString() === now.toDateString()
      ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString("en-CA");
  };

  const getSelectionIndex = (id: string, type: "driver" | "vehicle") => {
    const list = type === "driver" ? selectedDriverIds : selectedVehicleIds;
    const index = list.indexOf(id);
    return index !== -1 ? index + 1 : null;
  };

  // --- Selection Logic ---
  const handleDriverSelect = (id: string) => {
    setSelectedDriverIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleVehicleSelect = (id: string) => {
    setSelectedVehicleIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      return selectedDriverIds.length === 1 ? [id] : [...prev, id];
    });
  };

  const toggleSelection = (id: string, type: "driver" | "vehicle") => {
    if (type === "driver") handleDriverSelect(id);
    else handleVehicleSelect(id);
  };

  // --- Drag & Drop ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedDriverId(id);
    e.dataTransfer.setData("driverId", id);
  };

  const handleDrop = (e: React.DragEvent, vehicleId: string) => {
    e.preventDefault();
    const driverId = e.dataTransfer.getData("driverId");
    setDropTargetId(null);
    setDraggedDriverId(null);
    if (!driverId) return;

    setSelectedDriverIds((prevDrivers) => {
      const nextDrivers = prevDrivers.includes(driverId)
        ? prevDrivers
        : [...prevDrivers, driverId];
      setSelectedVehicleIds((prevVehicles) => {
        if (prevVehicles.includes(vehicleId)) return prevVehicles;
        return nextDrivers.length === 1
          ? [vehicleId]
          : [...prevVehicles, vehicleId];
      });
      return nextDrivers;
    });
  };

  const handleDriverHover = (e: React.MouseEvent, assign: Assigned) => {
    setHoveredAssign(assign);
    setModalPos({ x: e.clientX, y: e.clientY });
  };

  const handleDriverLeave = () => setHoveredAssign(null);

  const confirmAssignment = async () => {
    if (selectedDriverIds.length !== selectedVehicleIds.length) {
      alert("Driver and Vehicle count must match!");
      return;
    }
    try {
      const promises = selectedDriverIds.map((driverId, index) =>
        apiClient.post(
          "http://localhost:3001/master-vehicle/vehicle-driver-assign",
          {
            driver_id: driverId,
            vehicle_id: selectedVehicleIds[index],
          },
        ),
      );
      await Promise.all(promises);

      // Re-fetch after assign
      const [driversRes, vehiclesRes, assignedRes] = await Promise.all([
        apiClient.get(
          "http://localhost:3001/master-company/driver",
        ) as Promise<unknown>,
        apiClient.get(
          "http://localhost:3001/master-vehicle/vehicles",
        ) as Promise<unknown>,
        apiClient.get(
          "http://localhost:3001/master-vehicle/vehicle-driver-assign",
        ) as Promise<unknown>,
      ]);

      setDrivers((driversRes as DriverApiResponse).items || []);
      setVehicles((vehiclesRes as VehicleApiResponse).data || []);
      setAssigned((assignedRes as AssignedApiResponse).data || []);

      cancelSelection();
    } catch (error: unknown) {
      console.error("Assignment error:", error);
      alert("Assignment failed!");
    }
  };

  const cancelSelection = () => {
    setSelectedDriverIds([]);
    setSelectedVehicleIds([]);
  };

  const completeTrip = async (assignId: string) => {
    try {
      await apiClient.patch(
        `http://localhost:3001/master-vehicle/vehicle-driver-assign/${assignId}/complete`,
      );
      // Re-fetch after complete
      const [driversRes, vehiclesRes, assignedRes] = await Promise.all([
        apiClient.get(
          "http://localhost:3001/master-company/driver",
        ) as Promise<unknown>,
        apiClient.get(
          "http://localhost:3001/master-vehicle/vehicles",
        ) as Promise<unknown>,
        apiClient.get(
          "http://localhost:3001/master-vehicle/vehicle-driver-assign",
        ) as Promise<unknown>,
      ]);

      setDrivers((driversRes as DriverApiResponse).items || []);
      setVehicles((vehiclesRes as VehicleApiResponse).data || []);
      setAssigned((assignedRes as AssignedApiResponse).data || []);
    } catch (error: unknown) {
      console.error("Complete trip error:", error);
    }
  };

  return (
    <div className={styles.container}>
      <GridColumnsLayout>
        {/* Drivers */}
        <Column
          title="Available Drivers"
          leftIcon={<FontAwesomeIcon icon={faUser} />}
          count={filteredDrivers.length}
          searchSlot={
            <TextInput
              placeholder="Search Drivers"
              leftIcon={faSearch}
              value={driverSearch}
              onChange={(e) => setDriverSearch(e.target.value)}
            />
          }
        >
          {filteredDrivers.map((driver) => {
            const index = getSelectionIndex(driver.id, "driver");
            return (
              <div
                key={driver.id}
                draggable
                onDragStart={(e) => handleDragStart(e, driver.id)}
                onClick={() => toggleSelection(driver.id, "driver")}
                className={`${styles.cardWrapper} ${index ? styles.activeSelection : ""} ${draggedDriverId === driver.id ? styles.dragging : ""}`}
              >
                {index && <div className={styles.selectionBadge}>{index}</div>}
                <ColumnCard
                  title={driver.driver_name}
                  image={driver.image}
                  badge={driver.license_no}
                  nrc={driver.nrc}
                  phone={driver.phone}
                />
              </div>
            );
          })}
        </Column>

        {/* Vehicles */}
        <Column
          title="Available Vehicles"
          leftIcon={<FontAwesomeIcon icon={faCar} />}
          count={filteredVehicles.length}
          searchSlot={
            <TextInput
              placeholder="Search Vehicles"
              leftIcon={faSearch}
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
            />
          }
          filterSlot={
            <div className={styles.horizontalFilter}>
              <button
                className={`${styles.filterChip} ${!selectedVehicleName ? styles.activeFilter : ""}`}
                onClick={() => setSelectedVehicleName(null)}
              >
                All
              </button>
              {uniqueVehicleNames.map((name) => (
                <button
                  key={name}
                  className={`${styles.filterChip} ${selectedVehicleName === name ? styles.activeFilter : ""}`}
                  onClick={() =>
                    setSelectedVehicleName(
                      name === selectedVehicleName ? null : name,
                    )
                  }
                >
                  {name}
                </button>
              ))}
            </div>
          }
        >
          {filteredVehicles.map((vehicle) => {
            const index = getSelectionIndex(vehicle.id, "vehicle");
            const isOver = dropTargetId === vehicle.id;
            return (
              <div
                key={vehicle.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropTargetId(vehicle.id);
                }}
                onDragLeave={() => setDropTargetId(null)}
                onDrop={(e) => handleDrop(e, vehicle.id)}
                onClick={() => toggleSelection(vehicle.id, "vehicle")}
                className={`${styles.cardWrapper} ${index ? styles.activeSelection : ""} ${isOver ? styles.dropTarget : ""}`}
              >
                {index && (
                  <div
                    className={styles.selectionBadge}
                    style={{ backgroundColor: "#10b981" }}
                  >
                    {index}
                  </div>
                )}
                {isOver && (
                  <div className={styles.dropOverlay}>Drop to assign</div>
                )}
                <ColumnCard
                  title={vehicle.vehicle_name}
                  backgroundImage={vehicle.image}
                  badge={vehicle.license_plate}
                  odometer={vehicle.current_odometer}
                />
              </div>
            );
          })}
        </Column>

        {/* In Transit */}
        <Column
          leftIcon={<FontAwesomeIcon icon={faCaretRight} />}
          title="In-Transit"
          count={filteredAssigned.length}
          searchSlot={
            <TextInput
              placeholder="Search Assigns"
              leftIcon={faSearch}
              value={assignSearch}
              onChange={(e) => setAssignSearch(e.target.value)}
            />
          }
        >
          {filteredAssigned.map((assign) => (
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
                <div
                  className={styles.assignedCardCar}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => handleDriverHover(e, assign)}
                  onMouseMove={(e) =>
                    setModalPos({ x: e.clientX, y: e.clientY })
                  }
                  onMouseLeave={handleDriverLeave}
                  onClick={(e) => handleDriverHover(e, assign)}
                >
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
      {/* 1. Selection Confirmation Modal (Bottom Bar) */}
      {showModal && (
        <div className={styles.bottomModal}>
          <div className={styles.modalContent}>
            <p>
              Assign <strong>{selectedDriverIds.length}</strong> driver(s) to{" "}
              <strong>{selectedVehicleIds.length}</strong> vehicle(s)?
            </p>
            <div className={styles.modalActions}>
              <button className={styles.confirmBtn} onClick={confirmAssignment}>
                <FontAwesomeIcon icon={faCheck} /> Confirm
              </button>
              <button className={styles.cancelBtn} onClick={cancelSelection}>
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Driver Info Hover/Click Modal (Floating) */}
      {hoveredAssign && (
        <div
          className={styles.driverFloatingModal}
          style={{
            top: modalPos.y - 140,
            left: modalPos.x + 15,
          }}
        >
          <div className={styles.modalTitle}>
            <Image
              src={hoveredAssign.driver_image}
              alt="Driver"
              width={40}
              height={40}
              unoptimized
            />
            {hoveredAssign.driver_name}
          </div>

          <div className={styles.modalRow}>
            <span className={styles.modalLabel}>
              <FontAwesomeIcon icon={faAddressCard} />
            </span>
            <strong className={styles.modalValue}>
              {hoveredAssign.driver_nrc}
            </strong>
          </div>

          <div className={styles.modalRow}>
            <span className={styles.modalLabel}>
              <FontAwesomeIcon icon={faPhone} />
            </span>
            <span className={styles.modalValue}>{hoveredAssign.phone}</span>
          </div>

          <div className={styles.modalRow}>
            <span className={styles.modalLabel}>
              {hoveredAssign.driver_license_type}
            </span>
            <span className={styles.modalValue}>
              {hoveredAssign.driver_license}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
