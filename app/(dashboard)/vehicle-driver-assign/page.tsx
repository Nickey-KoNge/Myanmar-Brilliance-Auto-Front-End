"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
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
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { apiClient } from "@/app/features/lib/api-client";
import styles from "./page.module.css";

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
  createdAt: string;
  status: string;
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
type AssignedApiResponse = { data?: Assigned[] };

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
  const [hoveredAssign, setHoveredAssign] = useState<Assigned | null>(null);
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });

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

  const fetchMainData = useCallback(async () => {
    try {
      const [driversRes, vehiclesRes, assignedRes] = await Promise.all([
        apiClient.get(
          `http://localhost:3001/master-company/driver`,
        ) as Promise<unknown>,
        apiClient.get(
          `http://localhost:3001/master-vehicle/vehicles`,
        ) as Promise<unknown>,
        apiClient.get(
          `http://localhost:3001/master-vehicle/vehicle-driver-assign`,
        ) as Promise<unknown>,
      ]);

      setDrivers((driversRes as DriverApiResponse).items || []);
      setVehicles((vehiclesRes as VehicleApiResponse).data || []);
      setAssigned((assignedRes as AssignedApiResponse).data || []);
    } catch (error: unknown) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchMainData();
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
    let filtered = drivers
      .filter((d) => d.status === "Active")
      .filter((d) => !pendingPairs.some((p) => p.driver?.id === d.id));

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
  }, [drivers, pendingPairs, activeFilters, stations]);

  const availableVehicles = useMemo(() => {
    let filtered = vehicles
      .filter((v) => v.status === "Active")
      .filter((v) => !pendingPairs.some((p) => p.vehicle?.id === v.id));

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
  }, [vehicles, pendingPairs, activeFilters, stations]);

  const ongoingTrips = useMemo(
    () => assigned.filter((a) => a.status === "Ongoing"),
    [assigned],
  );

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
    if (
      nextDrivers.length > 0 &&
      nextVehicles.length > 0 &&
      nextDrivers.length === nextVehicles.length
    ) {
      const newPairs: PendingPair[] = nextDrivers.map((drv, idx) => ({
        id: `pair-${Date.now()}-${idx}`,
        driver: drv,
        vehicle: nextVehicles[idx],
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      setPendingPairs((prev) => [...newPairs, ...prev]);
      setSelectedDrivers([]);
      setSelectedVehicles([]);
    } else {
      setSelectedDrivers(nextDrivers);
      setSelectedVehicles(nextVehicles);
    }
  };

  const moveToCenter = (type: "driver" | "vehicle", item: Driver | Vehicle) => {
    setPendingPairs((prev) => {
      const existingIdx = prev.findIndex((p) => p[type] === null);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          [type]: item,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        return updated;
      } else {
        return [
          {
            id: `pair-${Date.now()}`,
            driver: type === "driver" ? (item as Driver) : null,
            vehicle: type === "vehicle" ? (item as Vehicle) : null,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
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
      await fetchMainData();
    } catch (error) {
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
      await fetchMainData();
    } catch (error) {
      console.error(error);
      alert("Some assignments failed!");
    }
  };

  const completeTrip = async (assignId: string) => {
    try {
      await apiClient.patch(
        `http://localhost:3001/master-vehicle/vehicle-driver-assign/${assignId}/complete`,
      );
      await fetchMainData();
    } catch (error) {
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
            <div className={styles.filterHeader}>
              <FontAwesomeIcon icon={faFilter} className={styles.iconColor} />
              <span className={styles.filterTitle}>Filters</span>
              {searchTags.length > 0 && (
                <button onClick={clearAllTags} className={styles.clearAllBtn}>
                  <b>Clear all</b>
                </button>
              )}
            </div>

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
                  icon={faSearch}
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
            </div>
          </div>
        </div>
      </header>

      <main className={styles.mainBoard}>
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
                {pendingPairs.some((p) => p.driver && p.vehicle) && (
                  <button
                    onClick={confirmAllAssignments}
                    className={styles.assignAllBtn}
                  >
                    <FontAwesomeIcon
                      icon={faCheckDouble}
                      className={styles.btnjoin}
                    />{" "}
                    အားလုံးချိတ်မည်
                  </button>
                )}
              </div>
            )}

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

            {ongoingTrips.map((assign) => (
              <div key={assign.id} className={styles.ongoingCard}>
                <div className={styles.ongoingTop}>
                  <span className={styles.ongoingTime}>
                    {formatSmartDate(assign.createdAt)}
                  </span>
                  <button
                    onClick={() => completeTrip(assign.id)}
                    className={styles.completeBtn}
                  >
                    <FontAwesomeIcon icon={faUndo} /> ပြီးဆုံး
                  </button>
                </div>
                <div className={styles.ongoingContent}>
                  <div
                    className={styles.ongoingItem}
                    onMouseEnter={(e) => {
                      setHoveredAssign(assign);
                      setModalPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setHoveredAssign(null)}
                  >
                    <Image
                      src={assign.driver_image}
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
                  <div className={styles.ongoingItem}>
                    <Image
                      src={assign.vehicle_image}
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
          </div>
        </section>

        <section className={styles.column}>
          <div className={styles.colHeader}>
            <h2 className={styles.colTitle}>
              <FontAwesomeIcon icon={faCar} className={styles.iconColor} />
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
      </main>

      {hoveredAssign && (
        <div
          className={styles.floatingModal}
          style={{ top: modalPos.y - 140, left: modalPos.x + 15 }}
        >
          <div className={styles.modalTitle}>
            <Image
              src={hoveredAssign.driver_image}
              alt="Driver"
              width={36}
              height={36}
              className={styles.modalImg}
              unoptimized
            />{" "}
            {hoveredAssign.driver_name}
          </div>
          <div className={styles.modalRow}>
            <FontAwesomeIcon
              icon={faAddressCard}
              className={styles.modalIcon}
            />{" "}
            <strong>{hoveredAssign.driver_nrc}</strong>
          </div>
          <div className={styles.modalRow}>
            <FontAwesomeIcon icon={faPhone} className={styles.modalIcon} />{" "}
            <span>{hoveredAssign.phone}</span>
          </div>
        </div>
      )}
    </div>
  );
}
