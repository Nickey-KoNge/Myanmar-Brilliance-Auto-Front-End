"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCar,
  faBolt,
  faCheck,
  faTimes,
  faUndo,
  faAddressCard,
  faPhone,
  faCheckDouble,
  faFilter,
  faLink,
  faKey,
  faRoute,
  faIdCard,
  faTachometerAlt,
  faBarcode,
  faPalette,
  faCheckCircle,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { apiClient } from "@/app/features/lib/api-client";
import styles from "./page.module.css";
import CommonModal from "@/app/components/AssignAlert/CommonModel";

const generatePairId = (index?: number) =>
  `pair-${Date.now()}-${index ?? Math.floor(Math.random() * 1000)}`;
const getCurrentTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
type Station = { id: string; name?: string; station_name?: string };
type Driver = {
  id: string;
  driver_name: string;
  nrc: string;
  phone: string;
  license_no: string;
  image: string;
  status: string;
  station_id?: string;
  license_type?: string;
};

type Vehicle = {
  id: string;
  vehicle_name: string;
  license_plate: string;
  status: string;
  image: string;
  current_odometer: string;
  station_id?: string;
  group_id?: string;
  vehicle_model_id?: string;
  taxi_number?: string;
  serial_no?: string;
  vin_no?: string;
  engine_no?: string;
  color?: string;
  license_type?: string;
  license_expire_date?: string;
  service_interval?: string;
  purchase_date?: string;
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
  current_odometer: string;
  createdAt: string;
  status: string;
  vehicle?: Vehicle | null;
  driver?: Driver | null;
  taxi_number: string;
  city_taxi_no?: string;
  color: string;
};

type PendingPair = {
  id: string;
  driver: Driver | null;
  vehicle: Vehicle | null;
  time: string;
};
type DragItem = { type: "driver" | "vehicle"; item: Driver | Vehicle };
type StationApiResponse = { data?: Station[]; items?: Station[] };
type DriverApiResponse = { items?: Driver[] };
type VehicleApiResponse = { data?: Vehicle[] };

type AssignedApiResponse = {
  data?: Assigned[];
  totalPages?: number;
  currentPage?: number;
  total?: number;
};

export default function VehicleDriverAssignPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assigned, setAssigned] = useState<Assigned[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [pendingPairs, setPendingPairs] = useState<PendingPair[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [isDragOverCenter, setIsDragOverCenter] = useState<boolean>(false);
  const [hoveredAssign, setHoveredAssign] = useState<{
    assign: Assigned;
    type: "driver" | "vehicle";
  } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [assignFilters, setAssignFilters] = useState({
    station_id: "",
    status: "Ongoing",
    startDate: "",
    endDate: "",
    driverKey: "",
    vehicleKey: "",
    licenseType: "",
  });

  const clearPendingPairs = () => {
    if (confirm("ရွေးချယ်ထားသော တွဲဖက်မှုများကို ဖျက်ရန် သေချာပါသလား?")) {
      setPendingPairs([]);
      setSelectedDrivers([]);
      setSelectedVehicles([]);
    }
  };

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = (await apiClient.get(
          "master-company/stations",
        )) as StationApiResponse;
        setStations(res.data || res.items || []);
      } catch (error: unknown) {
        console.error(error);
      }
    };
    fetchStations();
  }, []);

  const fetchMainData = useCallback(
    async (page: number = 1) => {
      try {
        const params = new URLSearchParams();
        if (assignFilters.station_id)
          params.append("station_id", assignFilters.station_id);
        if (assignFilters.status) params.append("status", assignFilters.status);
        if (assignFilters.startDate)
          params.append("startDate", assignFilters.startDate);
        if (assignFilters.endDate)
          params.append("endDate", assignFilters.endDate);
        if (inputValue.trim()) params.append("search", inputValue.trim());

        params.append("page", page.toString());
        params.append("limit", "5");

        const [driversRes, vehiclesRes, assignedRes] = await Promise.all([
          apiClient.get(
            `http://localhost:3001/master-company/driver`,
          ) as Promise<DriverApiResponse>,
          apiClient.get(
            `http://localhost:3001/master-vehicle/vehicles`,
          ) as Promise<VehicleApiResponse>,
          apiClient.get(
            `http://localhost:3001/master-vehicle/vehicle-driver-assign?${params.toString()}`,
          ) as Promise<AssignedApiResponse>,
        ]);

        setDrivers(driversRes.items || []);
        setVehicles(vehiclesRes.data || []);
        setAssigned(assignedRes.data || []);
        setCurrentPage(assignedRes.currentPage || page);
        setTotalPages(assignedRes.totalPages || 1);
      } catch (error: unknown) {
        console.error(error);
      }
    },
    [assignFilters, inputValue],
  );

  useEffect(() => {
    const loadData = async () => {
      await fetchMainData(1);
      setSelectedDrivers([]);
      setSelectedVehicles([]);
      setPendingPairs([]);
    };
    loadData();
  }, [fetchMainData]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      if (!searchTags.includes(inputValue.trim())) {
        setSearchTags([...searchTags, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSearchTags(searchTags.filter((tag) => tag !== tagToRemove));
  };

  const clearAllTags = () => {
    setSearchTags([]);
    setInputValue("");
  };

  const activeFilters = useMemo(() => {
    const filters = [...searchTags];
    if (inputValue.trim() !== "") filters.push(inputValue.trim());
    return filters;
  }, [searchTags, inputValue]);

  const availableDrivers = useMemo(() => {
    let filtered = drivers.filter(
      (d) =>
        d.status === "Active" &&
        !pendingPairs.some((p) => p.driver?.id === d.id),
    );
    if (assignFilters.station_id) {
      filtered = filtered.filter(
        (d) => d.station_id === assignFilters.station_id,
      );
    }

    // Sidebar Driver Filter အလုပ်လုပ်ရန်
    if (assignFilters.driverKey) {
      const key = assignFilters.driverKey.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          (d.driver_name || "").toLowerCase().includes(key) ||
          (d.nrc || "").toLowerCase().includes(key) ||
          (d.phone || "").toLowerCase().includes(key),
      );
    }
    if (assignFilters.licenseType) {
      filtered = filtered.filter(
        (d) => d.license_type === assignFilters.licenseType,
      );
    }

    // အရင်ကရှိပြီးသား Global Search Tags တွေ အလုပ်လုပ်ရန်
    if (activeFilters.length > 0) {
      const stationTags = activeFilters.filter((tag) =>
        stations.some((s) =>
          (s.name || s.station_name || "")
            .toLowerCase()
            .includes(tag.toLowerCase()),
        ),
      );
      const otherTags = activeFilters.filter(
        (tag) => !stationTags.includes(tag),
      );

      filtered = filtered.filter((d) => {
        let passStation = true;
        if (stationTags.length > 0) {
          const station = stations.find((s) => s.id === d.station_id);
          const stationName = (
            station?.name ||
            station?.station_name ||
            ""
          ).toLowerCase();
          passStation = stationTags.some((tag) =>
            stationName.includes(tag.toLowerCase()),
          );
        }
        let passOther = true;
        if (otherTags.length > 0) {
          passOther = otherTags.some((tag) => {
            const searchStr = tag.toLowerCase();
            return (
              (d.driver_name || "").toLowerCase().includes(searchStr) ||
              (d.license_no || "").toLowerCase().includes(searchStr)
            );
          });
        }
        return passStation && passOther;
      });
    }
    return filtered;
  }, [
    drivers,
    pendingPairs,
    activeFilters,
    stations,
    assignFilters.driverKey,
    assignFilters.licenseType,
    assignFilters.station_id,
  ]);

  const availableVehicles = useMemo(() => {
    let filtered = vehicles.filter(
      (v) =>
        v.status === "Active" &&
        !pendingPairs.some((p) => p.vehicle?.id === v.id),
    );
    if (assignFilters.station_id) {
      filtered = filtered.filter(
        (v) => v.station_id === assignFilters.station_id,
      );
    }
    // Sidebar Vehicle Filter အလုပ်လုပ်ရန်
    if (assignFilters.vehicleKey) {
      const key = assignFilters.vehicleKey.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          (v.vehicle_name || "").toLowerCase().includes(key) ||
          (v.license_plate || "").toLowerCase().includes(key) ||
          (v.taxi_number || "").toLowerCase().includes(key),
      );
    }

    // အရင်ကရှိပြီးသား Global Search Tags တွေ အလုပ်လုပ်ရန်
    if (activeFilters.length > 0) {
      const stationTags = activeFilters.filter((tag) =>
        stations.some((s) =>
          (s.name || s.station_name || "")
            .toLowerCase()
            .includes(tag.toLowerCase()),
        ),
      );
      const otherTags = activeFilters.filter(
        (tag) => !stationTags.includes(tag),
      );

      filtered = filtered.filter((v) => {
        let passStation = true;
        if (stationTags.length > 0) {
          const station = stations.find((s) => s.id === v.station_id);
          const stationName = (
            station?.name ||
            station?.station_name ||
            ""
          ).toLowerCase();
          passStation = stationTags.some((tag) =>
            stationName.includes(tag.toLowerCase()),
          );
        }
        let passOther = true;
        if (otherTags.length > 0) {
          passOther = otherTags.some((tag) => {
            const searchStr = tag.toLowerCase();
            return (
              (v.vehicle_name || "").toLowerCase().includes(searchStr) ||
              (v.license_plate || "").toLowerCase().includes(searchStr)
            );
          });
        }
        return passStation && passOther;
      });
    }
    return filtered;
  }, [
    vehicles,
    pendingPairs,
    activeFilters,
    stations,
    assignFilters.vehicleKey,
    assignFilters.station_id,
  ]);
  const showWarningModal = (title: string, message: string) => {
    setModalContent({ title, message });
    setIsModalOpen(true);
  };
  // အလယ်က Live Board Data များကိုပါ Filter လုပ်ပေးရန်
  const displayTrips = useMemo(() => {
    let filtered = assigned;
    if (assignFilters.status) {
      filtered = filtered.filter((a) => a.status === assignFilters.status);
    }
    if (assignFilters.driverKey) {
      const key = assignFilters.driverKey.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          (a.driver_name || "").toLowerCase().includes(key) ||
          (a.driver_nrc || "").toLowerCase().includes(key) ||
          (a.phone || "").toLowerCase().includes(key),
      );
    }
    if (assignFilters.vehicleKey) {
      const key = assignFilters.vehicleKey.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          (a.vehicle_name || "").toLowerCase().includes(key) ||
          (a.vehicle_license || "").toLowerCase().includes(key) ||
          (a.taxi_number || "").toLowerCase().includes(key) ||
          (a.city_taxi_no || "").toLowerCase().includes(key),
      );
    }
    if (assignFilters.licenseType) {
      filtered = filtered.filter(
        (a) => a.driver_license_type === assignFilters.licenseType,
      );
    }
    return filtered;
  }, [
    assigned,
    assignFilters.driverKey,
    assignFilters.vehicleKey,
    assignFilters.licenseType,
    assignFilters.status,
  ]);

  const toggleSelection = (
    type: "driver" | "vehicle",
    item: Driver | Vehicle,
  ) => {
    let nextDrivers = [...selectedDrivers];
    let nextVehicles = [...selectedVehicles];

    if (type === "driver") {
      if (nextDrivers.some((d) => d.id === item.id))
        nextDrivers = nextDrivers.filter((d) => d.id !== item.id);
      else nextDrivers.push(item as Driver);
    } else {
      if (nextVehicles.some((v) => v.id === item.id))
        nextVehicles = nextVehicles.filter((v) => v.id !== item.id);
      else nextVehicles.push(item as Vehicle);
    }

    // Driver နဲ့ Vehicle အရေအတွက်တူညီပါက တွဲပေးမည့်အပိုင်း
    if (
      nextDrivers.length > 0 &&
      nextVehicles.length > 0 &&
      nextDrivers.length === nextVehicles.length
    ) {
      let hasError = false;
      const newPairs: PendingPair[] = [];

      for (let i = 0; i < nextDrivers.length; i++) {
        // Station တူ/မတူ စစ်ဆေးခြင်း
        if (nextDrivers[i].station_id !== nextVehicles[i].station_id) {
          showWarningModal(
            "Station မတူညီပါ",
            `အမှား: ယာဉ်မောင်း (${nextDrivers[i].driver_name}) နှင့် ကား (${nextVehicles[i].vehicle_name}) တို့သည် Station မတူညီပါ။ တွဲဖက်၍မရပါ။`,
          );

          hasError = true;
          break;
        } else {
          newPairs.push({
            id: generatePairId(i),
            driver: nextDrivers[i],
            vehicle: nextVehicles[i],
            time: getCurrentTime(),
          });
        }
      }

      // Station မတူတာမရှိမှ (Error မရှိမှ) Board ပေါ်တင်ပါမည်
      if (!hasError) {
        setPendingPairs((prev) => [...newPairs, ...prev]);
        setSelectedDrivers([]);
        setSelectedVehicles([]);
      } else {
        // Station မတူတာပါလာရင် ရွေးချယ်ထားတာတွေကို ပြန်ဖျက်ပါမည်
        setSelectedDrivers([]);
        setSelectedVehicles([]);
      }
    } else {
      setSelectedDrivers(nextDrivers);
      setSelectedVehicles(nextVehicles);
    }
  };

  const moveToCenter = (type: "driver" | "vehicle", item: Driver | Vehicle) => {
    setPendingPairs((prev) => {
      const existingIdx = prev.findIndex((p) => p[type] === null);

      if (existingIdx !== -1) {
        const existingItem =
          type === "driver"
            ? prev[existingIdx].vehicle
            : prev[existingIdx].driver;

        if (existingItem && existingItem.station_id !== item.station_id) {
          showWarningModal(
            "Station မတူညီပါ",
            "Station မတူညီသော ယာဉ်မောင်းနှင့် ကားကို တွဲဖက်၍ မရပါ။",
          );
          return prev;
        }

        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          [type]: item,
          time: getCurrentTime(),
        };
        return updated;
      } else {
        return [
          {
            id: generatePairId(),
            driver: type === "driver" ? (item as Driver) : null,
            vehicle: type === "vehicle" ? (item as Vehicle) : null,
            time: getCurrentTime(),
          },
          ...prev,
        ];
      }
    });
  };
  const removeFromCenter = (pairId: string, type: "driver" | "vehicle") => {
    setPendingPairs((prev) => {
      const newPairs = [...prev];
      const idx = newPairs.findIndex((p) => p.id === pairId);
      if (idx === -1) return prev;
      newPairs[idx][type] = null;
      if (newPairs[idx].driver === null && newPairs[idx].vehicle === null)
        newPairs.splice(idx, 1);
      return newPairs;
    });
  };

  const handleDragStart = (
    e: React.DragEvent,
    type: "driver" | "vehicle",
    item: Driver | Vehicle,
  ) => {
    setDraggedItem({ type, item });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCenterDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCenter(true);
    e.dataTransfer.dropEffect = "move";
  };

  const handleCenterDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCenter(false);
    if (!draggedItem) return;
    moveToCenter(draggedItem.type, draggedItem.item);
    setDraggedItem(null);
  };

  const confirmAssignment = async (pair: PendingPair) => {
    if (!pair.driver || !pair.vehicle) return;
    try {
      await apiClient.post(
        "http://localhost:3001/master-vehicle/vehicle-driver-assign",
        { driver_id: pair.driver.id, vehicle_id: pair.vehicle.id },
      );
      setPendingPairs((prev) => prev.filter((p) => p.id !== pair.id));
      await fetchMainData(currentPage);
    } catch (error: unknown) {
      console.error(error);
      alert("Assignment failed!");
    }
  };

  const confirmAllAssignments = async () => {
    const validPairs = pendingPairs.filter((p) => p.driver && p.vehicle);
    if (validPairs.length === 0) return;
    try {
      await Promise.all(
        validPairs.map((pair) =>
          apiClient.post(
            "http://localhost:3001/master-vehicle/vehicle-driver-assign",
            { driver_id: pair.driver!.id, vehicle_id: pair.vehicle!.id },
          ),
        ),
      );
      const validIds = validPairs.map((p) => p.id);
      setPendingPairs((prev) => prev.filter((p) => !validIds.includes(p.id)));
      await fetchMainData(currentPage);
    } catch (error: unknown) {
      console.error(error);
      alert("Some assignments failed!");
    }
  };

  const completeTrip = async (assignId: string) => {
    try {
      await apiClient.patch(
        `http://localhost:3001/master-vehicle/vehicle-driver-assign/${assignId}/complete`,
      );
      await fetchMainData(currentPage);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const formatSmartDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const now = new Date();
    return date.toDateString() === now.toDateString()
      ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString("en-CA");
  };

  const handleMouseEnter = (
    e: React.MouseEvent,
    assign: Assigned,
    type: "driver" | "vehicle",
  ) => {
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);

    hoverTimeout.current = setTimeout(() => {
      setHoveredAssign({ assign, type });
      setModalPos({ x: clientX, y: clientY });
    }, 300); // 300ms ကြာမှ ပေါ်မည်
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredAssign(null);
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.headerTitle}>
            <FontAwesomeIcon icon={faKey} className={styles.shieldIcon} />
            Driver & Vehicle Assignment
          </h1>
          <p className={styles.headerSubtitle}>
            {draggedItem ? (
              <span className={styles.pulseText}>
                အလယ်အကွက်ထဲသို့ ဆွဲချပါ...
              </span>
            ) : (
              "ယာဉ်မောင်း သို့မဟုတ် ကားကို အလယ်သို့ Drag ဆွဲထည့်ပါ (သို့) ကလစ်နှိပ်ပါ။"
            )}
          </p>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.filterSection}>
            <div className={styles.tagsAndSearchContainer}>
              {searchTags.map((tag) => (
                <span key={tag} className={styles.searchTag}>
                  {tag}
                  <FontAwesomeIcon
                    icon={faTimes}
                    className={styles.tagCloseIcon}
                    onClick={() => removeTag(tag)}
                  />
                </span>
              ))}

              <div className={styles.searchWrapper}>
                <FontAwesomeIcon
                  icon={faFilter}
                  className={styles.searchIcon}
                />
                <input
                  type="text"
                  placeholder="Station, ကား, ယာဉ်မောင်း ရှာရန်... (Enter ခေါက်ပါ)"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={styles.searchInput}
                />
              </div>
              {searchTags.length > 0 && (
                <button onClick={clearAllTags} className={styles.clearAllBtn}>
                  <b>Clear all</b>
                </button>
              )}
              <div className={styles.filterbox}>
                <div
                  className={styles.filterHeader}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <FontAwesomeIcon
                    icon={faSliders}
                    className={styles.iconColor}
                  />
                  <span className={styles.filterTitle}> Filters</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.mainBoard}>
        {/* Drivers Column */}
        <section className={styles.column}>
          <div className={styles.colHeader}>
            <h2 className={styles.colTitle}>
              <FontAwesomeIcon icon={faUser} className={styles.iconColor} />{" "}
              ယာဉ်မောင်းများ
              <span className={styles.badgeCount}>
                {availableDrivers.length}
              </span>
            </h2>
          </div>
          <div className={styles.colBody}>
            {availableDrivers.map((driver) => {
              const selectedIndex = selectedDrivers.findIndex(
                (d) => d.id === driver.id,
              );
              const isSelected = selectedIndex !== -1;
              return (
                <div
                  key={driver.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, "driver", driver)}
                  onDragEnd={() => setDraggedItem(null)}
                  onClick={() => toggleSelection("driver", driver)}
                  className={`${styles.card} ${draggedItem?.item.id === driver.id ? styles.cardDragging : ""} ${isSelected ? styles.cardSelected : ""}`}
                >
                  {isSelected && (
                    <div className={styles.selectionNumberBadge}>
                      {selectedIndex + 1}
                    </div>
                  )}
                  <div
                    className={`${styles.cardImageWrapper} ${styles.cardImageWrapperDriver}`}
                  >
                    {driver.image ? (
                      <Image
                        src={driver.image}
                        alt="D"
                        fill
                        className={styles.cardImage}
                        unoptimized
                      />
                    ) : (
                      <div className={styles.cardFallback}>
                        {driver.driver_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardName}>{driver.driver_name}</div>
                    <div className={styles.cardDetail}>{driver.license_no}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Center Live Board */}
        <section
          onDragOver={handleCenterDragOver}
          onDragLeave={() => setIsDragOverCenter(false)}
          onDrop={handleCenterDrop}
          className={`${styles.centerColumn} ${isDragOverCenter ? styles.centerDragOver : ""}`}
        >
          <div className={styles.colHeaderCenter}>
            <h2 className={styles.colTitleWhite}>
              <FontAwesomeIcon icon={faRoute} className={styles.iconColor} />
              Live Assignment Board
            </h2>
          </div>
          <div className={styles.centerBody}>
            {pendingPairs.length > 0 && (
              <div className={styles.pendingHeaderRow}>
                <div className={styles.sectionTitle}>
                  ပြင်ဆင်ဆဲ - {pendingPairs.length} တွဲ
                </div>
                <div className={styles.actionButtons}>
                  <button
                    onClick={clearPendingPairs}
                    className={styles.clearPendingBtn}
                  >
                    <FontAwesomeIcon icon={faUndo} /> ဖျက်မည်
                  </button>
                  <button
                    onClick={confirmAllAssignments}
                    className={styles.assignAllBtn}
                  >
                    <FontAwesomeIcon icon={faCheckDouble} /> အားလုံးချိတ်မည်
                  </button>
                </div>
              </div>
            )}

            {/* Pending Pairs Render */}
            {pendingPairs.map((pair) => {
              const isComplete = pair.driver && pair.vehicle;
              return (
                <div
                  key={pair.id}
                  className={`${styles.pairCard} ${isComplete ? styles.pairComplete : styles.pairIncomplete}`}
                >
                  <div
                    className={`${styles.slot} ${pair.driver ? styles.slotFilled : styles.slotEmpty}`}
                  >
                    {pair.driver ? (
                      <>
                        <div
                          className={`${styles.slotImage} ${styles.slotImageDriver}`}
                        >
                          {pair.driver.image ? (
                            <Image
                              src={pair.driver.image}
                              alt="D"
                              fill
                              unoptimized
                            />
                          ) : (
                            pair.driver.driver_name.charAt(0)
                          )}
                        </div>
                        <div className={styles.slotInfo}>
                          <div className={styles.slotName}>
                            {pair.driver.driver_name}
                          </div>
                          <div className={styles.slotSub}>
                            {pair.driver.license_no}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCenter(pair.id, "driver")}
                          className={styles.removeBtn}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </>
                    ) : (
                      <div className={styles.slotPlaceholder}>
                        <FontAwesomeIcon icon={faUser} /> ယာဉ်မောင်း
                      </div>
                    )}
                  </div>
                  <div className={styles.pairIndicator}>
                    {isComplete ? (
                      <button
                        onClick={() => confirmAssignment(pair)}
                        className={styles.confirmBtn}
                      >
                        <FontAwesomeIcon icon={faCheck} /> ချိတ်မည်
                      </button>
                    ) : (
                      <div className={styles.waitIndicator}>
                        <FontAwesomeIcon icon={faBolt} />
                      </div>
                    )}
                  </div>
                  <div
                    className={`${styles.slot} ${styles.slotRight} ${pair.vehicle ? styles.slotFilled : styles.slotEmpty}`}
                  >
                    {pair.vehicle ? (
                      <>
                        <button
                          onClick={() => removeFromCenter(pair.id, "vehicle")}
                          className={styles.removeBtnLeft}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <div className={styles.slotInfoRight}>
                          <div className={styles.slotName}>
                            {pair.vehicle.vehicle_name}
                          </div>
                          <div className={styles.slotSub}>
                            {pair.vehicle.license_plate}
                          </div>
                        </div>
                        <div
                          className={`${styles.slotImage} ${styles.slotImageVehicle}`}
                        >
                          {pair.vehicle.image ? (
                            <Image
                              src={pair.vehicle.image}
                              alt="V"
                              fill
                              unoptimized
                            />
                          ) : (
                            <FontAwesomeIcon icon={faCar} />
                          )}
                        </div>
                      </>
                    ) : (
                      <div className={styles.slotPlaceholder}>
                        ကား <FontAwesomeIcon icon={faCar} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Display Assigned Trips */}
            {displayTrips.map((assign) => (
              <div key={assign.id} className={styles.ongoingCard}>
                <div className={styles.ongoingTop}>
                  <span className={styles.ongoingTime}>
                    {formatSmartDate(assign.createdAt)}
                  </span>
                  {assign.status === "Ongoing" && (
                    <button
                      onClick={() => completeTrip(assign.id)}
                      className={styles.completeBtn}
                    >
                      <FontAwesomeIcon icon={faUndo} /> ပြီးဆုံး
                    </button>
                  )}
                </div>

                <div className={styles.ongoingContent}>
                  {/* Driver ကို ထောက်လျှင် */}
                  <div
                    className={styles.ongoingItem}
                    onMouseEnter={(e) => handleMouseEnter(e, assign, "driver")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Image
                      src={assign.driver_image || "/fallback-driver.png"}
                      alt="D"
                      width={32}
                      height={32}
                      className={styles.ongoingImg}
                      unoptimized
                    />
                    <span>{assign.driver_name}</span>
                  </div>

                  <FontAwesomeIcon
                    icon={faLink}
                    className={styles.ongoingLink}
                  />

                  {/* Vehicle ကို ထောက်လျှင် */}
                  <div
                    className={styles.ongoingItem}
                    onMouseEnter={(e) => handleMouseEnter(e, assign, "vehicle")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Image
                      src={assign.vehicle_image || "/fallback-vehicle.png"}
                      alt="V"
                      width={32}
                      height={32}
                      className={styles.ongoingImg}
                      unoptimized
                    />
                    <span>{assign.vehicle_license}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className={styles.paginationWrapper}>
                <button
                  className={styles.pageBtn}
                  disabled={currentPage === 1}
                  onClick={() => fetchMainData(currentPage - 1)}
                >
                  &laquo; ယခင်
                </button>

                <span className={styles.pageInfo}>
                  စာမျက်နှာ {currentPage} / {totalPages}
                </span>

                <button
                  className={styles.pageBtn}
                  disabled={currentPage === totalPages}
                  onClick={() => fetchMainData(currentPage + 1)}
                >
                  နောက်သို့ &raquo;
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Vehicles Column */}
        <section className={styles.column}>
          <div className={styles.colHeader}>
            <h2 className={styles.colTitle}>
              <FontAwesomeIcon icon={faCar} className={styles.iconColor} />{" "}
              ကားများ
              <span className={styles.badgeCount}>
                {availableVehicles.length}
              </span>
            </h2>
          </div>
          <div className={styles.colBody}>
            {availableVehicles.map((vehicle) => {
              const selectedIndex = selectedVehicles.findIndex(
                (v) => v.id === vehicle.id,
              );
              const isSelected = selectedIndex !== -1;
              return (
                <div
                  key={vehicle.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, "vehicle", vehicle)}
                  onDragEnd={() => setDraggedItem(null)}
                  onClick={() => toggleSelection("vehicle", vehicle)}
                  className={`${styles.card} ${draggedItem?.item.id === vehicle.id ? styles.cardDragging : ""} ${isSelected ? styles.cardSelected : ""}`}
                >
                  {isSelected && (
                    <div className={styles.selectionNumberBadge}>
                      {selectedIndex + 1}
                    </div>
                  )}
                  <div
                    className={`${styles.cardImageWrapper} ${styles.cardImageWrapperVehicle}`}
                  >
                    {vehicle.image ? (
                      <Image
                        src={vehicle.image}
                        alt="V"
                        fill
                        className={styles.cardImage}
                        unoptimized
                      />
                    ) : (
                      <FontAwesomeIcon icon={faCar} />
                    )}
                  </div>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardName}>
                      {vehicle.vehicle_name}
                    </div>
                    <div className={styles.cardDetail}>
                      {vehicle.license_plate}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sidebar Filters */}
        {isFilterOpen && (
          <aside className={styles.sideFilterCard}>
            <div className={styles.filterCardHeader}>
              <span>
                <FontAwesomeIcon icon={faFilter} /> စစ်ထုတ်မှုများ
              </span>
              <button
                onClick={() => {
                  setAssignFilters({
                    station_id: "",
                    status: "Ongoing",
                    startDate: "",
                    endDate: "",
                    driverKey: "",
                    vehicleKey: "",
                    licenseType: "",
                  });
                  setTimeout(() => fetchMainData(1), 100);
                }}
                className={styles.resetText}
              >
                ရှင်းလင်းမည်
              </button>
            </div>

            <div className={styles.filterGroup}>
              <p className={styles.groupLabel}>စတေရှင် (Station)</p>
              <select
                className={styles.filterSelect}
                value={assignFilters.station_id}
                onChange={(e) =>
                  setAssignFilters({
                    ...assignFilters,
                    station_id: e.target.value,
                  })
                }
              >
                <option value="">အားလုံး (All)</option>
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name || st.station_name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <p className={styles.groupLabel}>ရက်စွဲ (Date Range)</p>
              <span className={styles.dateTo}>From (အစ ရက်) -</span>
              <div className={styles.dateInputs}>
                <input
                  type="date"
                  className={styles.filterInput}
                  value={assignFilters.startDate}
                  onChange={(e) =>
                    setAssignFilters({
                      ...assignFilters,
                      startDate: e.target.value,
                    })
                  }
                />
                <span className={styles.dateTo}>To (အဆုံး ရက်) -</span>
                <input
                  type="date"
                  className={styles.filterInput}
                  value={assignFilters.endDate}
                  onChange={(e) =>
                    setAssignFilters({
                      ...assignFilters,
                      endDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* လိုင်စင်အမျိုးအစားကို Radio Button အဖြစ်ပြောင်းထားသည် */}
            <div className={styles.filterGroup}>
              <p className={styles.groupLabel}>လိုင်စင်အမျိုးအစား</p>
              <div className={styles.radioGroupGrid}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="licenseType"
                    value=""
                    checked={assignFilters.licenseType === ""}
                    onChange={(e) =>
                      setAssignFilters({
                        ...assignFilters,
                        licenseType: e.target.value,
                      })
                    }
                  />
                  အားလုံး
                </label>
                {Array.from(
                  new Set(drivers.map((d) => d.license_type).filter(Boolean)),
                ).map((type) => (
                  <label key={type} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="licenseType"
                      value={type}
                      checked={assignFilters.licenseType === type}
                      onChange={(e) =>
                        setAssignFilters({
                          ...assignFilters,
                          licenseType: e.target.value,
                        })
                      }
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <hr
              style={{
                borderColor: "var(--border-color)",
                margin: "10px 0",
                opacity: 0.5,
              }}
            />

            {/* အခြေအနေ (Status) ကို Radio Button အဖြစ်ပြောင်းထားသည် */}
            <div className={styles.filterGroup}>
              <p className={styles.groupLabel}>အခြေအနေ (Status)</p>
              <div className={styles.radioGroup}>
                {[
                  { label: "အားလုံး (All)", value: "" },
                  { label: "Ongoing (ချိတ်ဆက်ဆဲ)", value: "Ongoing" },
                  { label: "Completed (ပြီးဆုံး)", value: "Completed" },
                ].map((st) => (
                  <label key={st.value} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="status"
                      value={st.value}
                      checked={assignFilters.status === st.value}
                      onChange={(e) =>
                        setAssignFilters({
                          ...assignFilters,
                          status: e.target.value,
                        })
                      }
                    />
                    {st.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>
        )}
      </main>

      {/* Driver & Vehicle Info Modal On Hover */}
      {hoveredAssign && (
        <div
          className={styles.floatingModal}
          style={{ top: modalPos.y - 140, left: modalPos.x + 20 }}
        >
          {hoveredAssign.type === "driver" && (
            <div className={styles.modalSection}>
              <div className={styles.modalSectionTitle}>
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className={styles.checkIcon}
                />{" "}
                ယာဉ်မောင်း အချက်အလက်
              </div>
              <div className={styles.modalHeader}>
                <Image
                  src={
                    hoveredAssign.assign.driver_image || "/fallback-driver.png"
                  }
                  alt="Driver"
                  width={40}
                  height={40}
                  className={styles.modalImg}
                  unoptimized
                />
                <span className={styles.modalName}>
                  {hoveredAssign.assign.driver_name}
                </span>
              </div>
              <div className={styles.modalRow}>
                <FontAwesomeIcon
                  icon={faAddressCard}
                  className={styles.modalIcon}
                />
                <strong>{hoveredAssign.assign.driver_nrc}</strong>
              </div>
              <div className={styles.modalRow}>
                <FontAwesomeIcon icon={faPhone} className={styles.modalIcon} />
                <span>{hoveredAssign.assign.phone}</span>
              </div>
              <div className={styles.modalRow}>
                <FontAwesomeIcon icon={faIdCard} className={styles.modalIcon} />
                <span>
                  လိုင်စင်:{" "}
                  <span className={styles.modalHighlight}>
                    {hoveredAssign.assign.driver_license} (
                    {hoveredAssign.assign.driver_license_type || "-"})
                  </span>
                </span>
              </div>
            </div>
          )}

          {hoveredAssign.type === "vehicle" && (
            <div className={styles.modalSection}>
              <div className={styles.modalSectionTitle}>
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className={styles.checkIcon}
                />{" "}
                ကား အချက်အလက်
              </div>
              <div className={styles.modalHeader}>
                <Image
                  src={
                    hoveredAssign.assign.vehicle_image ||
                    "/fallback-vehicle.png"
                  }
                  alt="Vehicle"
                  width={40}
                  height={40}
                  className={`${styles.modalImg} ${styles.modalImgV}`}
                  unoptimized
                />
                <span className={styles.modalName}>
                  {hoveredAssign.assign.vehicle_name}
                </span>
              </div>
              <div className={styles.modalRow}>
                <FontAwesomeIcon icon={faCar} className={styles.modalIcon} />
                <strong>{hoveredAssign.assign.vehicle_license}</strong>
              </div>
              <div className={styles.modalRow}>
                <FontAwesomeIcon
                  icon={faTachometerAlt}
                  className={styles.modalIcon}
                />
                <span>
                  Odo:{" "}
                  <span className={styles.modalHighlight}>
                    {hoveredAssign.assign.current_odometer || "-"} km
                  </span>
                </span>
              </div>
              <div className={styles.modalRow}>
                <FontAwesomeIcon
                  icon={faBarcode}
                  className={styles.modalIcon}
                />
                <span>
                  Taxi No:{" "}
                  <span className={styles.modalHighlight}>
                    {hoveredAssign.assign.taxi_number ||
                      hoveredAssign.assign.city_taxi_no ||
                      "-"}
                  </span>
                </span>
              </div>
              <div className={styles.modalRow}>
                <FontAwesomeIcon
                  icon={faPalette}
                  className={styles.modalIcon}
                />
                <span>အရောင်: {hoveredAssign.assign.color || "-"}</span>
              </div>
            </div>
          )}
        </div>
      )}
      <CommonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
      />
    </div>
  );
}
